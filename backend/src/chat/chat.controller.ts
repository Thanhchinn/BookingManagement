import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ADMIN_ROLES, isAdminRole, USER_ROLE } from '../auth/auth.constants';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('admin-partner/last-messages')
  @Roles(...ADMIN_ROLES)
  async getAllLastMessages() {
    return this.chatService.getAllLastMessages();
  }

  @Get('admin-partner/:partnerId')
  async getMessages(@Param('partnerId') partnerId: string, @Request() req: any) {
    await this.chatService.assertCanAccessPartnerThread(req.user, partnerId);
    return this.chatService.getAdminPartnerMessages(partnerId);
  }

  @Post('admin-partner/:partnerId')
  async sendMessage(
    @Param('partnerId') partnerId: string,
    @Body('text') text: string,
    @Request() req: any,
  ) {
    const user = req.user;
    await this.chatService.assertCanAccessPartnerThread(user, partnerId);
    const senderType = isAdminRole(user.role) ? 'ADMIN' : 'PARTNER';
    const senderId = user.userId;

    return this.chatService.sendAdminPartnerMessage(
      partnerId,
      senderType,
      senderId,
      text,
    );
  }

  @Get('rooms')
  @Roles(USER_ROLE)
  async getRooms(@Request() req: any) {
    return this.chatService.getRooms(req.user.userId);
  }

  @Post('rooms/individual')
  @Roles(USER_ROLE)
  async createIndividualRoom(
    @Body('targetUserId') targetUserId: string,
    @Request() req: any,
  ) {
    return this.chatService.getOrCreateIndividualRoom(req.user.userId, targetUserId);
  }

  @Post('rooms/match/:matchPostId')
  @Roles(USER_ROLE)
  async createMatchRoom(@Param('matchPostId') matchPostId: string) {
    return this.chatService.getOrCreateMatchRoom(matchPostId);
  }

  @Get('rooms/:roomId/messages')
  @Roles(USER_ROLE)
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Request() req: any,
  ) {
    return this.chatService.getRoomMessages(roomId, req.user.userId);
  }

  @Post('rooms/:roomId/messages')
  @Roles(USER_ROLE)
  async sendRoomMessage(
    @Param('roomId') roomId: string,
    @Body('text') text: string,
    @Request() req: any,
  ) {
    return this.chatService.sendRoomMessage(roomId, req.user.userId, text);
  }
}
