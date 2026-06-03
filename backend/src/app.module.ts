import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { PartnersModule } from './partners/partners.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { ServicesModule } from './services/services.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AdminsModule,
    PartnersModule,
    AuthModule,
    CategoriesModule,
    LocationsModule,
    ServicesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

