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
import { PublicModule } from './public/public.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { ChatModule } from './chat/chat.module';
import { BookingsModule } from './bookings/bookings.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

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
    PublicModule,
    MatchmakingModule,
    ChatModule,
    BookingsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // max 100 requests per IP
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Thứ tự guard toàn cục: giới hạn tần suất -> xác thực JWT -> kiểm tra vai trò
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

