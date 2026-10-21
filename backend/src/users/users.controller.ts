import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  HttpCode, 
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpException,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ADMIN_ROLES, AuthUser, isAdminRole, USER_ROLE } from '../auth/auth.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Hàm helper để convert BigInt thành string/number giúp JSON serialization không bị lỗi
function serializeUser(user: any) {
  if (!user) return null;
  const { password, rememberToken, ...rest } = user; // Không bao giờ trả mật khẩu/token về client
  return {
    ...rest,
    id: user.id.toString(), // Convert BigInt to string
    latitude: user.latitude ? parseFloat(user.latitude.toString()) : null,
    longitude: user.longitude ? parseFloat(user.longitude.toString()) : null,
  };
}

// Chỉ Admin hoặc chính chủ tài khoản mới được xem/sửa thông tin người dùng
function assertAdminOrSelf(user: AuthUser, targetId: string) {
  if (isAdminRole(user.role)) return;
  if (user.role === USER_ROLE && user.userId === targetId) return;
  throw new ForbiddenException('Bạn không có quyền truy cập thông tin của người dùng khác.');
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 0. Upload ảnh đại diện
  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp).'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('Vui lòng chọn file để tải lên.', HttpStatus.BAD_REQUEST);
    }
    const avatarUrl = `http://localhost:3000/uploads/${file.filename}`;
    return { avatarUrl };
  }

  // 1. Thống kê nhanh thông số tài khoản (LƯU Ý: Phải đặt trước GET :id để tránh bị đè route)
  @Get('stats')
  @Roles(...ADMIN_ROLES)
  async getStats() {
    return this.usersService.getStats();
  }

  // 2. Lấy danh sách người dùng (Hỗ trợ phân trang và tìm kiếm phía máy chủ)
  @Get()
  @Roles(...ADMIN_ROLES)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (page || limit || search) {
      const result = await this.usersService.findPaginated({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
      });
      return {
        data: result.data.map(serializeUser),
        meta: result.meta,
      };
    }
    const users = await this.usersService.findAll();
    return users.map(serializeUser);
  }

  // 3. Lấy chi tiết một người dùng
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    assertAdminOrSelf(req.user, id);
    const user = await this.usersService.findOne(id);
    return serializeUser(user);
  }

  // 4. Tạo người dùng mới phía quản trị (Bảo mật nghiêm ngặt)
  @Post()
  @Roles(...ADMIN_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    return serializeUser(newUser);
  }

  // 5. Cập nhật thông tin người dùng
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    assertAdminOrSelf(req.user, id);
    const isAdmin = isAdminRole(req.user.role);
    const data = { ...updateUserDto };
    if (!isAdmin) {
      // Người dùng không được tự mở khóa tài khoản hay tự cộng điểm tích lũy
      delete data.isActive;
      delete data.loyaltyPoints;
    }
    const updatedUser = await this.usersService.update(id, data, { skipCurrentPasswordCheck: isAdmin });
    return serializeUser(updatedUser);
  }

  // 6. Xóa người dùng
  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
