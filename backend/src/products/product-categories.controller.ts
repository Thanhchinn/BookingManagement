import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { USER_ROLE } from '../auth/auth.constants';

@Controller('product-categories')
// Chỉ tài khoản khách hàng/đối tác (role USER); quyền sở hữu cơ sở được kiểm tra trong service
@Roles(USER_ROLE)
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.userId;
    return this.categoriesService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body('name') name: string,
    @Body('icon') icon: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.categoriesService.create(name, icon, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('icon') icon: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.categoriesService.update(id, name, icon, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.categoriesService.remove(id, userId);
  }
}
