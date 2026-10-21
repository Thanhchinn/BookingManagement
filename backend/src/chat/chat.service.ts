import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChatRoomType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Giờ:phút theo giờ Việt Nam (không phụ thuộc múi giờ của server)
function formatClock(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
}
import { AuthUser, isAdminRole, USER_ROLE } from '../auth/auth.constants';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Định dạng tin nhắn kênh hỗ trợ Admin <-> Đối tác (giữ nguyên định dạng API cũ).
  // Tin không có người gửi là user (admin gửi, hoặc admin đã bị xóa) được coi là của ADMIN.
  private serializeSupportMessage(msg: { id: bigint; senderId: bigint | null; senderAdminId: bigint | null; messageText: string; createdAt: Date }, partnerId: bigint) {
    const isPartner = msg.senderId !== null;
    return {
      id: msg.id.toString(),
      partnerId: partnerId.toString(),
      senderType: isPartner ? 'PARTNER' : 'ADMIN',
      senderId: (isPartner ? msg.senderId : msg.senderAdminId)?.toString() ?? null,
      text: msg.messageText,
      timestamp: formatClock(msg.createdAt),
      createdAt: msg.createdAt,
    };
  }

  // Phòng chat SUPPORT của đối tác (tạo khi cần), thành viên là tài khoản user của đối tác
  private async getOrCreateSupportRoom(partnerId: bigint) {
    const existing = await this.prisma.chatRoom.findUnique({ where: { partnerId } });
    if (existing) return existing;

    const partner = await this.prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      select: { userId: true, businessName: true },
    });
    if (!partner) {
      throw new NotFoundException('Không tìm thấy đối tác này.');
    }
    try {
      return await this.prisma.chatRoom.create({
        data: {
          type: ChatRoomType.SUPPORT,
          partnerId,
          name: `Hỗ trợ: ${partner.businessName}`,
          members: { create: { userId: partner.userId } },
        },
      });
    } catch {
      // Hai yêu cầu tạo cùng lúc: phòng đã được tạo bởi yêu cầu kia
      return this.prisma.chatRoom.findUniqueOrThrow({ where: { partnerId } });
    }
  }

  // Chỉ Admin hoặc chính chủ đối tác (user sở hữu hồ sơ) mới được xem/gửi tin trong kênh admin-partner
  async assertCanAccessPartnerThread(user: AuthUser, partnerId: string) {
    if (isAdminRole(user.role)) return;
    if (user.role === USER_ROLE) {
      const partner = await this.prisma.partnerProfile.findUnique({
        where: { id: BigInt(partnerId) },
        select: { userId: true },
      });
      if (partner && partner.userId.toString() === user.userId) return;
    }
    throw new ForbiddenException('Bạn không có quyền truy cập cuộc trò chuyện này.');
  }

  async getAdminPartnerMessages(partnerId: string) {
    const room = await this.prisma.chatRoom.findUnique({ where: { partnerId: BigInt(partnerId) } });
    if (!room) return [];
    const messages = await this.prisma.message.findMany({
      where: { chatRoomId: room.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return messages.map((m) => this.serializeSupportMessage(m, room.partnerId!));
  }

  async sendAdminPartnerMessage(
    partnerId: string,
    senderType: 'ADMIN' | 'PARTNER',
    senderId: string,
    text: string,
  ) {
    if (!text?.trim()) {
      throw new BadRequestException('Nội dung tin nhắn không được để trống.');
    }
    const room = await this.getOrCreateSupportRoom(BigInt(partnerId));
    const newMessage = await this.prisma.message.create({
      data: {
        chatRoomId: room.id,
        ...(senderType === 'ADMIN' ? { senderAdminId: BigInt(senderId) } : { senderId: BigInt(senderId) }),
        messageText: text.trim(),
      },
    });
    return this.serializeSupportMessage(newMessage, room.partnerId!);
  }

  async getAllLastMessages() {
    // 1 truy vấn cho mọi phòng SUPPORT (trước đây: 1 truy vấn cho mỗi đối tác)
    const rooms = await this.prisma.chatRoom.findMany({
      where: { type: ChatRoomType.SUPPORT },
      select: {
        partnerId: true,
        messages: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1 },
      },
    });

    const lastMessages: Record<string, any> = {};
    for (const room of rooms) {
      const msg = room.messages[0];
      if (msg && room.partnerId) {
        const { id, senderType, text, createdAt, timestamp } = this.serializeSupportMessage(msg, room.partnerId);
        lastMessages[room.partnerId.toString()] = { id, senderType, text, createdAt, timestamp };
      }
    }
    return lastMessages;
  }

  async getRooms(userId: string) {
    const userIdBigInt = BigInt(userId);
    
    // Tìm các room mà user này làm thành viên
    const roomMemberships = await this.prisma.chatRoomMember.findMany({
      where: { userId: userIdBigInt, chatRoom: { type: { not: ChatRoomType.SUPPORT } } },
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
            ? lastMsg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
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
      senderName: m.sender?.fullName ?? 'Quản trị viên',
      senderAvatar: m.sender?.avatarUrl || '🧑',
      isMe: m.senderId === userIdBig,
      text: m.messageText,
      timestamp: m.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
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
      senderName: msg.sender?.fullName ?? 'Quản trị viên',
      senderAvatar: msg.sender?.avatarUrl || '🧑',
      isMe: true,
      text: msg.messageText,
      timestamp: msg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
      type: msg.type
    };
  }
}
