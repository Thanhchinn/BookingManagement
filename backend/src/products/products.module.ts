import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PrismaModule, PartnersModule],
  controllers: [ProductsController, ProductCategoriesController],
  providers: [ProductsService, ProductCategoriesService],
  exports: [ProductsService, ProductCategoriesService],
})
export class ProductsModule {}
