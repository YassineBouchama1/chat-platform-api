import { Controller, Post, Body, Param, BadRequestException, Req, UseGuards, Get, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from 'src/conversation/schemas/conversation.schema';

import { RequestWithUser } from 'src/common/types/user.types';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('conversations')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  // @desc : for create conversation first time u will send msg to user
  @Post()
  async createConversation(@Body() createConversationDto: CreateConversationDto, @Req() req: RequestWithUser): Promise<Conversation> {
    try {
      return this.conversationService.createConversation(createConversationDto, req.userId);
    } catch (error) {

      throw new BadRequestException('Failed to Create conversation');
    }
  }
  @Get('user')
  async getUserConversations(
    @Req() req: RequestWithUser,

    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return await this.conversationService.getUserConversations(req.userId, page, limit);
    } catch (error) {
      throw new BadRequestException('Failed to get user conversations');
    }
  }


  @Get(':id')
  async getConversationById(@Param('id') id: string) {

    try {
      return this.conversationService.getConversationById(id);
    } catch (error) {

      throw new BadRequestException('Failed to getConversationById');
    }

  }


}
