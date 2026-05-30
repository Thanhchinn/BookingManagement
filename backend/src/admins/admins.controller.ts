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
import { AdminsService } from './admins.service';

// Hàm helper để convert BigInt thành string trong JSON response
function serializeAdmin(admin: any) {
  if (!admin) return null;
  return {
    ...admin,
    id: admin.id.toString(),
  };
}

@Controller('admins')
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
  async create(@Body() createAdminDto: any) {
    const newAdmin = await this.adminsService.create(createAdminDto);
    return serializeAdmin(newAdmin);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAdminDto: any) {
    const updatedAdmin = await this.adminsService.update(id, updateAdminDto);
    return serializeAdmin(updatedAdmin);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
