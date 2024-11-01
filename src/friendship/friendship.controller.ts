import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipStatusDto } from './dto/update-friendship.dto';

@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('send-request')
  async sendFriendRequest(@Body() createFriendshipDto: CreateFriendshipDto) {
    return this.friendshipService.sendFriendRequest(createFriendshipDto);
  }

  @Patch('update-status/:id')
  async updateFriendshipStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateFriendshipStatusDto,
  ) {
    return this.friendshipService.updateFriendshipStatus(id, updateStatusDto);
  }

  @Get('friends/:userId')
  async getFriends(@Param('userId') userId: string) {
    return this.friendshipService.getFriends(userId);
  }

  @Post('block-user')
  async blockUser(@Body() createFriendshipDto: CreateFriendshipDto) {
    const { requester, recipient } = createFriendshipDto;
    return this.friendshipService.blockUser(requester, recipient);
  }
}
