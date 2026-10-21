import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto';
import { Roles } from '../auth/decorators/roles.decorator';

// Hàm helper để convert BigInt thành string và loại bỏ mật khẩu khỏi JSON response
function serializeAdmin(admin: any) {
  if (!admin) return null;
  const { password, ...rest } = admin;
  return {
    ...rest,
    id: admin.id.toString(),
  };
}

// Chỉ SUPERADMIN được quản lý tài khoản quản trị
@Controller('admins')
@Roles('SUPERADMIN')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  async findAll() {
    const admins = await this.adminsService.findAll();
    return admins.map(serializeAdmin);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);
    return serializeAdmin(admin);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAdminDto: CreateAdminDto) {
    const newAdmin = await this.adminsService.create(createAdminDto);
    return serializeAdmin(newAdmin);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    // Không cho tự hạ quyền hoặc tự vô hiệu hóa chính mình (tránh mất hết SUPERADMIN)
    if (req.user.userId === id && (updateAdminDto.role !== undefined || updateAdminDto.isActive === false)) {
      throw new ForbiddenException('Không thể tự thay đổi vai trò hoặc vô hiệu hóa tài khoản của chính mình.');
    }
    const updatedAdmin = await this.adminsService.update(id, updateAdminDto);
    return serializeAdmin(updatedAdmin);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.userId === id) {
      throw new ForbiddenException('Không thể tự xóa tài khoản của chính mình.');
    }
    return this.adminsService.remove(id);
  }
}
