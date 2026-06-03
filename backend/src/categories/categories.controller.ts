import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 🌍 Public API: Lấy danh sách bộ môn thể thao (Hỗ trợ phân trang, tìm kiếm hoặc trả về toàn bộ)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (page || limit || search) {
      return this.categoriesService.findPaginated({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
      });
    }
    return this.categoriesService.findAll();
  }

  // 🌍 Public API: Xem chi tiết một bộ môn thể thao
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // 🛡️ Protected API: Tạo bộ môn mới (Chỉ dành cho Admin đã đăng nhập)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // 🛡️ Protected API: Cập nhật thông tin bộ môn (Chỉ dành cho Admin đã đăng nhập)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // 🛡️ Protected API: Xóa bộ môn thể thao (Chỉ dành cho Admin đã đăng nhập)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
