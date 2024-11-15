import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleTypes } from 'src/common/enums/user.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUser } from 'src/common/types/user.types';
import { Chat } from './schemas/chat.schema';
import { ChatService } from './chat.service';


@Controller('chats')
@UseGuards(AuthGuard)
@Roles(RoleTypes.User)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }



  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Req() req: RequestWithUser): Promise<Chat> {
    try {
      return this.chatService.createChat(createChatDto, req.userId);
    } catch (error) {

      throw new BadRequestException('Failed to create chat');
    }
  }


  //bring all user chats weather group or dm
  @Get()
  async getUserChats(
    @Req() req: RequestWithUser,

    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return await this.chatService.getUserChats(req.userId, page, limit);
    } catch (error) {
      throw new BadRequestException('Failed to get user conversations');
    }
  }



  // delete chat
  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {

    return this.chatService.deleteChat(chatId, req.userId);
  }



  //get all messages belong chats
  @Get(':chatId')
  async getChatById(
    @Param('chatId') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return await this.chatService.getChatById(chatId, page, limit);
    } catch (error) {
      throw new BadRequestException('Failed to get user conversations');
    }
  }



}
