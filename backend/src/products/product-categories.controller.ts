import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('product-categories')
@UseGuards(JwtAuthGuard)
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
