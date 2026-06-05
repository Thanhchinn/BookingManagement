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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Hàm helper để convert BigInt thành string/number giúp JSON serialization không bị lỗi
function serializeUser(user: any) {
  if (!user) return null;
  return {
    ...user,
    id: user.id.toString(), // Convert BigInt to string
    latitude: user.latitude ? parseFloat(user.latitude.toString()) : null,
    longitude: user.longitude ? parseFloat(user.longitude.toString()) : null,
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 0. Upload ảnh đại diện
  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.usersService.getStats();
  }

  // 2. Lấy danh sách người dùng (Hỗ trợ phân trang và tìm kiếm phía máy chủ)
  @Get()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return serializeUser(user);
  }

  // 4. Tạo người dùng mới phía quản trị (Bảo mật nghiêm ngặt)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    return serializeUser(newUser);
  }

  // 5. Cập nhật thông tin người dùng
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return serializeUser(updatedUser);
  }

  // 6. Xóa người dùng
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
