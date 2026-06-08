import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('admin-partner/last-messages')
  async getAllLastMessages() {
    return this.chatService.getAllLastMessages();
  }

  @Get('admin-partner/:partnerId')
  async getMessages(@Param('partnerId') partnerId: string) {
    return this.chatService.getAdminPartnerMessages(partnerId);
  }

  @Post('admin-partner/:partnerId')
  async sendMessage(
    @Param('partnerId') partnerId: string,
    @Body('text') text: string,
    @Request() req: any,
  ) {
    const user = req.user;
    const isSystemAdmin = ['ADMIN', 'SUPERADMIN', 'MODERATOR'].includes(user.role);
    const senderType = isSystemAdmin ? 'ADMIN' : 'PARTNER';
    const senderId = user.userId;

    return this.chatService.sendAdminPartnerMessage(
      partnerId,
      senderType,
      senderId,
      text,
    );
  }

  @Get('rooms')
  async getRooms(@Request() req: any) {
    return this.chatService.getRooms(req.user.userId);
  }

  @Post('rooms/individual')
  async createIndividualRoom(
    @Body('targetUserId') targetUserId: string,
    @Request() req: any,
  ) {
    return this.chatService.getOrCreateIndividualRoom(req.user.userId, targetUserId);
  }

  @Post('rooms/match/:matchPostId')
  async createMatchRoom(@Param('matchPostId') matchPostId: string) {
    return this.chatService.getOrCreateMatchRoom(matchPostId);
  }

  @Get('rooms/:roomId/messages')
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Request() req: any,
  ) {
    return this.chatService.getRoomMessages(roomId, req.user.userId);
  }

  @Post('rooms/:roomId/messages')
  async sendRoomMessage(
    @Param('roomId') roomId: string,
    @Body('text') text: string,
    @Request() req: any,
  ) {
    return this.chatService.sendRoomMessage(roomId, req.user.userId, text);
  }
}
