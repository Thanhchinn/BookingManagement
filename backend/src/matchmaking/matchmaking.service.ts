import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchPostDto } from './dto/create-match-post.dto';
import { ApplyMatchDto } from './dto/apply-match.dto';
import { ApproveParticipantDto } from './dto/approve-participant.dto';
import { ApprovePostDto } from './dto/approve-post.dto';

function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date('1970-01-01T00:00:00Z');
  d.setUTCHours(Number(hours), Number(minutes || 0), 0, 0);
  return d;
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

function formatTime(timeVal: any): string {
  if (!timeVal) return '';
  if (timeVal instanceof Date) {
    try {
      return timeVal.toISOString().split('T')[1].substring(0, 5);
    } catch {
      const hours = timeVal.getUTCHours().toString().padStart(2, '0');
      const minutes = timeVal.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  if (typeof timeVal === 'string') {
    return timeVal.substring(0, 5);
  }
  return '';
}

function serializeMatchPost(post: any) {
  return {
    id: post.id.toString(),
    userId: post.userId.toString(),
    hostName: post.user?.fullName || 'Người dùng',
    hostAvatar: post.user?.avatarUrl || '🧑',
    hostPhone: post.user?.phone || '0901234567',
    title: post.title,
    sport: post.sportsPitch?.category || 'Thể thao',
    courtName: `${post.sportsPitch?.location?.name || ''} - ${post.sportsPitch?.name || ''}`,
    courtAddress: post.sportsPitch?.location?.address || 'Địa chỉ sân thi đấu',
    playDate: post.playDate ? post.playDate.toISOString().split('T')[0] : '',
    startTime: formatTime(post.startTime),
    endTime: formatTime(post.endTime),
    skillLevel: post.skillLevel,
    maxPlayers: post.maxPlayers,
    currentPlayers: post.currentPlayers,
    description: post.description,
    status: post.status,
    participants: (post.participants || []).map((p: any) => ({
      id: p.id.toString(),
      userId: p.userId.toString(),
      name: p.user?.fullName || 'Người dùng',
      avatar: p.user?.avatarUrl || '🧑',
      status: p.status,
      note: p.note || '',
    })),
  };
}

@Injectable()
export class MatchmakingService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Khách hàng tạo bài đăng ghép đôi (Chờ Admin duyệt)
  async create(userId: string | number | bigint, dto: CreateMatchPostDto) {
    const pitchId = BigInt(dto.sportsPitchId);
    
    // Kiểm tra sân tồn tại
    const pitch = await this.prisma.sportsPitch.findUnique({
      where: { id: pitchId },
    });
    if (!pitch) {
      throw new NotFoundException('Không tìm thấy sân thi đấu đã chọn.');
    }

    const bookingId = dto.bookingId ? BigInt(dto.bookingId) : null;

    // Tạo MatchPost (mặc định status PENDING)
    const post = await this.prisma.matchPost.create({
      data: {
        userId: BigInt(userId),
        sportsPitchId: pitchId,
        bookingId: bookingId,
        title: dto.title,
        description: dto.description || '',
        playDate: parseDate(dto.playDate),
        startTime: parseTimeToDate(dto.startTime),
        endTime: parseTimeToDate(dto.endTime),
        skillLevel: dto.skillLevel || 'ANY',
        maxPlayers: dto.maxPlayers,
        currentPlayers: 1,
        status: 'PENDING',
      },
    });

    // Tự động thêm Host làm participant với trạng thái JOINED
    await this.prisma.matchParticipant.create({
      data: {
        matchPostId: post.id,
        userId: BigInt(userId),
        status: 'JOINED',
        note: 'Host đăng bài',
      },
    });

    return this.findOne(post.id);
  }

  // 2. Lấy danh sách công khai (Đã được duyệt OPEN hoặc FULL)
  async findPublic(filters: { sport?: string; playDate?: string; skillLevel?: string; search?: string }) {
    const where: any = {
      status: { in: ['OPEN', 'FULL'] },
    };

    if (filters.sport && filters.sport !== 'ALL') {
      where.sportsPitch = {
        category: filters.sport,
      };
    }

    if (filters.playDate) {
      where.playDate = parseDate(filters.playDate);
    }

    if (filters.skillLevel && filters.skillLevel !== 'ALL') {
      where.skillLevel = filters.skillLevel;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          sportsPitch: {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { location: { name: { contains: filters.search, mode: 'insensitive' } } },
            ],
          },
        },
      ];
    }

    const posts = await this.prisma.matchPost.findMany({
      where,
      include: {
        user: { select: { fullName: true, avatarUrl: true, phone: true } },
        sportsPitch: {
          include: {
            location: { select: { name: true, address: true } },
          },
        },
        participants: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { playDate: 'asc' },
    });

    return posts.map(serializeMatchPost);
  }

  // 3. Xem danh sách bài đăng của tôi (Host)
  async findMyPosts(userId: string | number | bigint) {
    const posts = await this.prisma.matchPost.findMany({
      where: {
        userId: BigInt(userId),
      },
      include: {
        user: { select: { fullName: true, avatarUrl: true, phone: true } },
        sportsPitch: {
          include: {
            location: { select: { name: true, address: true } },
          },
        },
        participants: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return posts.map(serializeMatchPost);
  }

  // 3.5 Lấy các bài đăng ghép đôi người dùng tham gia (Host hoặc đã JOINED)
  async findJoinedMatches(userId: string | number | bigint) {
    const posts = await this.prisma.matchPost.findMany({
      where: {
        OR: [
          { userId: BigInt(userId) },
          {
            participants: {
              some: {
                userId: BigInt(userId),
                status: 'JOINED',
              },
            },
          },
        ],
      },
      include: {
        user: { select: { fullName: true, avatarUrl: true, phone: true } },
        sportsPitch: {
          include: {
            location: { select: { name: true, address: true } },
          },
        },
        participants: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { playDate: 'asc' },
    });

    return posts.map(serializeMatchPost);
  }

  // 4. Lấy chi tiết bài viết
  async findOne(id: string | number | bigint) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: { select: { fullName: true, avatarUrl: true, phone: true } },
        sportsPitch: {
          include: {
            location: { select: { name: true, address: true } },
          },
        },
        participants: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    return serializeMatchPost(post);
  }

  // 5. Nộp đơn xin gia nhập trận đấu
  async applyToJoin(userId: string | number | bigint, matchPostId: string | number | bigint, dto: ApplyMatchDto) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(matchPostId) },
      include: { participants: true },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    if (post.status !== 'OPEN') {
      throw new BadRequestException('Ca ghép đôi này hiện tại không mở nhận người chơi.');
    }

    // Check xem đã tham gia chưa
    const alreadyParticipant = post.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (alreadyParticipant) {
      throw new BadRequestException('Bạn đã nộp đơn ứng tuyển hoặc đã tham gia ca này rồi.');
    }

    // Đăng ký làm participant PENDING
    await this.prisma.matchParticipant.create({
      data: {
        matchPostId: post.id,
        userId: BigInt(userId),
        status: 'PENDING',
        note: dto.note || '',
      },
    });

    return this.findOne(post.id);
  }

  // 6. Host duyệt/từ chối tuyển thủ ứng tuyển
  async approveParticipant(
    userId: string | number | bigint,
    matchPostId: string | number | bigint,
    participantId: string | number | bigint,
    dto: ApproveParticipantDto,
  ) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(matchPostId) },
      include: { participants: true },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    // Bảo mật: chỉ Host mới được duyệt
    if (post.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('Chỉ có chủ bài đăng mới được quyền duyệt thành viên.');
    }

    // Tìm participant
    const participant = await this.prisma.matchParticipant.findUnique({
      where: { id: BigInt(participantId) },
    });

    if (!participant || participant.matchPostId.toString() !== post.id.toString()) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển của tuyển thủ này.');
    }

    if (participant.status !== 'PENDING') {
      throw new BadRequestException('Đơn ứng tuyển này đã được xử lý từ trước.');
    }

    // Cập nhật trạng thái ứng cử viên
    await this.prisma.matchParticipant.update({
      where: { id: participant.id },
      data: { status: dto.status },
    });

    // Tính toán lại số lượng JOINED players hiện tại
    const updatedPost = await this.prisma.matchPost.findUnique({
      where: { id: post.id },
      include: { participants: true },
    });

    if (!updatedPost) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    const joinedCount = updatedPost.participants.filter((p) => p.status === 'JOINED').length;
    const newStatus = joinedCount >= post.maxPlayers ? 'FULL' : 'OPEN';

    // Lưu lại số lượng
    await this.prisma.matchPost.update({
      where: { id: post.id },
      data: {
        currentPlayers: joinedCount,
        status: newStatus,
      },
    });

    return this.findOne(post.id);
  }

  // 6.2 Người tham gia tự hủy/rút lui khỏi trận đấu
  async leaveMatch(userId: string | number | bigint, matchPostId: string | number | bigint, reason?: string) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(matchPostId) },
      include: {
        participants: {
          include: {
            user: { select: { fullName: true } }
          }
        },
        user: { select: { fullName: true } }
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    // Tìm xem user có là participant với status JOINED hoặc PENDING không
    const participant = post.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!participant) {
      throw new BadRequestException('Bạn không tham gia trận đấu này.');
    }

    await this.prisma.matchParticipant.delete({
      where: { id: participant.id },
    });

    // Tạo thông báo cho Host
    try {
      const pName = participant.user?.fullName || 'Một tuyển thủ';
      const mTitle = post.title || 'Ca ghép kèo';
      await this.prisma.notification.create({
        data: {
          userId: post.userId,
          title: 'Tuyển thủ hủy tham gia kèo đấu',
          message: `Tuyển thủ ${pName} đã hủy tham gia ca đấu "${mTitle}". Lý do: ${reason || 'Không có lý do cụ thể'}`,
          type: 'MATCH',
        }
      });
    } catch (err) {
      console.error('Lỗi khi gửi thông báo hủy tham gia:', err);
    }

    // Tính toán lại số lượng JOINED players hiện tại
    const updatedPost = await this.prisma.matchPost.findUnique({
      where: { id: post.id },
      include: { participants: true },
    });

    if (updatedPost) {
      const joinedCount = updatedPost.participants.filter((p) => p.status === 'JOINED').length;
      const newStatus = joinedCount >= post.maxPlayers ? 'FULL' : 'OPEN';

      await this.prisma.matchPost.update({
        where: { id: post.id },
        data: {
          currentPlayers: joinedCount,
          status: newStatus,
        },
      });
    }

    return { message: 'Bạn đã hủy tham gia trận đấu này thành công.' };
  }

  // 6.5 Host xóa/kick thành viên khỏi trận đấu
  async removeParticipant(
    userId: string | number | bigint,
    matchPostId: string | number | bigint,
    participantId: string | number | bigint,
    reason?: string,
  ) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(matchPostId) },
      include: {
        participants: {
          include: {
            user: { select: { fullName: true } }
          }
        },
        user: { select: { fullName: true } }
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    // Bảo mật: chỉ Host mới được kick
    if (post.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('Chỉ có chủ bài đăng mới được quyền xóa thành viên.');
    }

    // Tìm participant
    const participant = await this.prisma.matchParticipant.findUnique({
      where: { id: BigInt(participantId) },
    });

    if (!participant || participant.matchPostId.toString() !== post.id.toString()) {
      throw new NotFoundException('Không tìm thấy thành viên này trong ca đấu.');
    }

    // Không thể xóa chính Host (nếu vì lý do nào đó Host lọt vào danh sách)
    if (participant.userId.toString() === post.userId.toString()) {
      throw new BadRequestException('Bạn không thể tự xóa chính mình khỏi danh sách tuyển thủ.');
    }

    await this.prisma.matchParticipant.delete({
      where: { id: participant.id },
    });

    // Tạo thông báo cho Tuyển thủ bị xóa
    try {
      const hostName = post.user?.fullName || 'Chủ phòng';
      const mTitle = post.title || 'Ca ghép kèo';
      await this.prisma.notification.create({
        data: {
          userId: participant.userId,
          title: 'Bạn đã bị xóa khỏi ca ghép kèo',
          message: `Chủ phòng ${hostName} đã xóa bạn khỏi ca đấu "${mTitle}". Lý do: ${reason || 'Không có lý do cụ thể'}`,
          type: 'MATCH',
        }
      });
    } catch (err) {
      console.error('Lỗi khi gửi thông báo xóa tuyển thủ:', err);
    }

    // Tính toán lại số lượng JOINED players hiện tại
    const updatedPost = await this.prisma.matchPost.findUnique({
      where: { id: post.id },
      include: { participants: true },
    });

    if (updatedPost) {
      const joinedCount = updatedPost.participants.filter((p) => p.status === 'JOINED').length;
      const newStatus = joinedCount >= post.maxPlayers ? 'FULL' : 'OPEN';

      await this.prisma.matchPost.update({
        where: { id: post.id },
        data: {
          currentPlayers: joinedCount,
          status: newStatus,
        },
      });
    }

    return this.findOne(post.id);
  }

  // 7. Hủy/Xóa bài đăng ghép đôi (Chỉ Host hoặc Admin mới có quyền)
  async remove(userId: string | number | bigint, matchPostId: string | number | bigint, role?: string) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(matchPostId) },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    const isAdmin = role && role !== 'USER';

    if (!isAdmin && post.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('Chỉ có chủ bài đăng hoặc Quản trị viên mới được quyền hủy/xóa bài đăng.');
    }

    // Chỉ cho phép Host xóa khi đến giờ chơi
    if (!isAdmin) {
      const playDateObj = new Date(post.playDate);
      const startTimeObj = new Date(post.startTime);
      const playStartDateTime = new Date(playDateObj);
      playStartDateTime.setUTCHours(startTimeObj.getUTCHours(), startTimeObj.getUTCMinutes(), 0, 0);

      if (new Date() < playStartDateTime) {
        const timeStr = formatTime(post.startTime);
        const dateStr = post.playDate.toISOString().split('T')[0];
        throw new BadRequestException(`Bạn chỉ có thể hủy/xóa bài đăng ghép đôi sau khi đã đến giờ chơi của ca đấu (Giờ bắt đầu: ${timeStr} ngày ${dateStr}).`);
      }
    }

    await this.prisma.matchPost.delete({
      where: { id: post.id },
    });

    return { message: 'Hủy bài đăng ghép đôi thành công.' };
  }

  // ==========================================================================
  // PHẦN ADMIN: DUYỆT & QUẢN LÝ BÀI ĐĂNG TOÀN HỆ THỐNG
  // ==========================================================================

  // Admin lấy danh sách bài đăng
  async adminFindAll(options: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) {
      where.status = options.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.matchPost.findMany({
        where,
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          sportsPitch: {
            include: {
              location: { select: { name: true } },
            },
          },
          participants: {
            include: {
              user: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.matchPost.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(serializeMatchPost),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // Admin phê duyệt hoặc từ chối bài viết
  async adminApprove(matchPostId: string | number | bigint, dto: ApprovePostDto) {
    const post = await this.prisma.matchPost.findUnique({
      where: { id: BigInt(matchPostId) },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng ghép đôi.');
    }

    if (post.status !== 'PENDING') {
      throw new BadRequestException('Bài đăng này đã được kiểm duyệt từ trước.');
    }

    await this.prisma.matchPost.update({
      where: { id: post.id },
      data: { status: dto.status },
    });

    return this.findOne(post.id);
  }
}
