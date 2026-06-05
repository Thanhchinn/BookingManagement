import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PrismaModule, PartnersModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
