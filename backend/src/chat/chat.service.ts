import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeMessage(msg: any) {
    return {
      id: msg.id.toString(),
      partnerId: msg.partnerId.toString(),
      senderType: msg.senderType,
      senderId: msg.senderId.toString(),
      text: msg.messageText,
      timestamp: msg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: msg.createdAt,
    };
  }

  async getAdminPartnerMessages(partnerId: string) {
    const messages = await this.prisma.adminPartnerMessage.findMany({
      where: { partnerId: BigInt(partnerId) },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => this.serializeMessage(m));
  }

  async sendAdminPartnerMessage(
    partnerId: string,
    senderType: 'ADMIN' | 'PARTNER',
    senderId: string,
    text: string,
  ) {
    // Kiểm tra xem đối tác có tồn tại không
    const partner = await this.prisma.partnerProfile.findUnique({
      where: { id: BigInt(partnerId) },
    });
    if (!partner) {
      throw new NotFoundException('Không tìm thấy đối tác này.');
    }

    const newMessage = await this.prisma.adminPartnerMessage.create({
      data: {
        partnerId: BigInt(partnerId),
        senderType,
        senderId: BigInt(senderId),
        messageText: text,
      },
    });

    return this.serializeMessage(newMessage);
  }

  async getAllLastMessages() {
    const partners = await this.prisma.partnerProfile.findMany({
      select: { id: true },
    });

    const lastMessages: Record<string, any> = {};
    for (const p of partners) {
      const msg = await this.prisma.adminPartnerMessage.findFirst({
        where: { partnerId: p.id },
        orderBy: { createdAt: 'desc' },
      });
      if (msg) {
        lastMessages[p.id.toString()] = {
          id: msg.id.toString(),
          senderType: msg.senderType,
          text: msg.messageText,
          createdAt: msg.createdAt,
          timestamp: msg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }
    return lastMessages;
  }

  async getRooms(userId: string) {
    const userIdBigInt = BigInt(userId);
    
    // Tìm các room mà user này làm thành viên
    const roomMemberships = await this.prisma.chatRoomMember.findMany({
      where: { userId: userIdBigInt },
      include: {
        chatRoom: {
          include: {
            matchPost: {
              include: {
                sportsPitch: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        }
      }
    });

    const rooms = await Promise.all(
      roomMemberships.map(async (membership) => {
        const room = membership.chatRoom;
        const lastMsg = room.messages[0] || null;
        
        let name = room.name || 'Phòng trò chuyện';
        let avatar = '💬';
        let sport: string | undefined = undefined;

        if (room.type === 'MATCH' && room.matchPost) {
          name = room.matchPost.title;
          sport = room.matchPost.sportsPitch?.category || 'Thể thao';
          avatar = sport === 'Bóng Đá' ? '⚽' : sport === 'Cầu Lông' ? '🏸' : sport === 'Tennis' ? '🎾' : sport === 'Bóng Rổ' ? '🏀' : '🏟️';
        } else if (room.type === 'INDIVIDUAL') {
          // Lấy thành viên còn lại
          const otherMember = room.members.find(m => m.userId !== userIdBigInt);
          if (otherMember) {
            name = otherMember.user.fullName;
            avatar = otherMember.user.avatarUrl || '🧑';
          }
        }

        // Đếm unreadCount
        let unreadCount = 0;
        if (membership.lastReadAt) {
          unreadCount = await this.prisma.message.count({
            where: {
              chatRoomId: room.id,
              createdAt: { gt: membership.lastReadAt }
            }
          });
        } else {
          unreadCount = await this.prisma.message.count({
            where: {
              chatRoomId: room.id
            }
          });
        }

        return {
          id: room.id.toString(),
          name,
          avatar,
          type: room.type,
          sport,
          unreadCount,
          lastMessage: lastMsg ? lastMsg.messageText : 'Chưa có tin nhắn mới.',
          lastMessageTime: lastMsg 
            ? lastMsg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '',
          lastMessageDate: lastMsg ? lastMsg.createdAt : null
        };
      })
    );

    // Sắp xếp các room có tin nhắn mới nhất lên đầu
    return rooms.sort((a, b) => {
      const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getOrCreateIndividualRoom(currentUserId: string, targetUserId: string) {
    const currentUserIdBig = BigInt(currentUserId);
    const targetUserIdBig = BigInt(targetUserId);

    if (currentUserIdBig === targetUserIdBig) {
      throw new BadRequestException('Không thể tạo phòng chat với chính mình.');
    }

    // Kiểm tra xem user target có tồn tại không
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserIdBig }
    });
    if (!targetUser) {
      throw new NotFoundException('Không tìm thấy người dùng này.');
    }

    // Tìm xem đã có room cá nhân giữa 2 người này chưa
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        type: 'INDIVIDUAL',
        AND: [
          { members: { some: { userId: currentUserIdBig } } },
          { members: { some: { userId: targetUserIdBig } } }
        ]
      }
    });

    if (existingRoom) {
      return {
        id: existingRoom.id.toString(),
        type: existingRoom.type
      };
    }

    // Nếu chưa có, tạo phòng mới trong transaction
    const newRoom = await this.prisma.$transaction(async (tx) => {
      const room = await tx.chatRoom.create({
        data: {
          type: 'INDIVIDUAL'
        }
      });

      await tx.chatRoomMember.createMany({
        data: [
          { chatRoomId: room.id, userId: currentUserIdBig },
          { chatRoomId: room.id, userId: targetUserIdBig }
        ]
      });

      return room;
    });

    return {
      id: newRoom.id.toString(),
      type: newRoom.type
    };
  }

  async getOrCreateMatchRoom(matchPostId: string) {
    const matchIdBig = BigInt(matchPostId);
    
    // Tìm post
    const post = await this.prisma.matchPost.findUnique({
      where: { id: matchIdBig },
      include: {
        participants: {
          where: { status: 'JOINED' }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    // Tìm xem đã có room chưa
    let room = await this.prisma.chatRoom.findUnique({
      where: { matchPostId: matchIdBig }
    });

    if (!room) {
      // Tạo room và thêm thành viên
      room = await this.prisma.$transaction(async (tx) => {
        const r = await tx.chatRoom.create({
          data: {
            type: 'MATCH',
            matchPostId: matchIdBig,
            name: post.title
          }
        });

        const memberData = post.participants.map((p) => ({
          chatRoomId: r.id,
          userId: p.userId
        }));

        if (memberData.length > 0) {
          await tx.chatRoomMember.createMany({
            data: memberData
          });
        }

        return r;
      });
    }

    return {
      id: room.id.toString(),
      type: room.type
    };
  }

  async getRoomMessages(roomId: string, userId: string) {
    const roomIdBig = BigInt(roomId);
    const userIdBig = BigInt(userId);

    // Kiểm tra xem user có phải thành viên của room không
    const membership = await this.prisma.chatRoomMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomIdBig,
          userId: userIdBig
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không phải thành viên của phòng chat này.');
    }

    // Cập nhật lastReadAt
    await this.prisma.chatRoomMember.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() }
    });

    // Lấy tin nhắn
    const messages = await this.prisma.message.findMany({
      where: { chatRoomId: roomIdBig },
      include: {
        sender: {
          select: {
            fullName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return messages.map((m) => ({
      id: m.id.toString(),
      senderName: m.sender.fullName,
      senderAvatar: m.sender.avatarUrl || '🧑',
      isMe: m.senderId === userIdBig,
      text: m.messageText,
      timestamp: m.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: m.type
    }));
  }

  async sendRoomMessage(roomId: string, userId: string, text: string) {
    const roomIdBig = BigInt(roomId);
    const userIdBig = BigInt(userId);

    // Kiểm tra thành viên
    const membership = await this.prisma.chatRoomMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomIdBig,
          userId: userIdBig
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không phải thành viên của phòng chat này.');
    }

    const msg = await this.prisma.message.create({
      data: {
        chatRoomId: roomIdBig,
        senderId: userIdBig,
        messageText: text,
        type: 'TEXT'
      },
      include: {
        sender: {
          select: {
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Cập nhật luôn lastReadAt của người gửi
    await this.prisma.chatRoomMember.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() }
    });

    return {
      id: msg.id.toString(),
      senderName: msg.sender.fullName,
      senderAvatar: msg.sender.avatarUrl || '🧑',
      isMe: true,
      text: msg.messageText,
      timestamp: msg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: msg.type
    };
  }
}
