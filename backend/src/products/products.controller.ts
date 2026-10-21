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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { USER_ROLE } from '../auth/auth.constants';

@Controller('products')
// Chỉ tài khoản khách hàng/đối tác (role USER); quyền sở hữu cơ sở được kiểm tra trong service
@Roles(USER_ROLE)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('location/:locationId')
  async findByLocation(@Param('locationId') locationId: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.productsService.findByLocation(locationId, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.productsService.findOne(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.productsService.create(createProductDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.productsService.remove(id, userId);
  }
}
