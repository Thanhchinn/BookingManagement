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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

