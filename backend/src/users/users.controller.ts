import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { UsersService } from './users.service';

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

  // 1. Lấy toàn bộ người dùng
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(serializeUser);
  }

  // 2. Lấy chi tiết một người dùng
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return serializeUser(user);
  }

  // 3. Đăng ký/Tạo người dùng mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: any) {
    const newUser = await this.usersService.create(createUserDto);
    return serializeUser(newUser);
  }

  // 4. Cập nhật thông tin người dùng
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return serializeUser(updatedUser);
  }

  // 5. Xóa người dùng
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
