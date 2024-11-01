import { BadRequestException, Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { JoinChannelDto } from './dto/join-channel.dto';
import { Channel } from 'src/channel/schemas/channel.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleTypes } from 'src/common/enums/user.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUser } from 'src/common/types/user.types';


@Controller('channels')
@UseGuards(AuthGuard)
// @Roles(RoleTypes.User)
export class ChannelController {
  constructor(private readonly channelService: ChannelService) { }

  @Post('join')
  async joinChannel(@Body() joinChannelDto: JoinChannelDto, @Req() req: RequestWithUser): Promise<Channel> {
    const { channelId } = joinChannelDto;
    try {
      return this.channelService.joinChannel(req.userId, channelId);
    } catch (error) {

      throw new BadRequestException('Failed to Join channel');
    }
  }


  @Post('create')
  async createChannel(@Body() createChannelDto: CreateChannelDto, @Req() req: RequestWithUser): Promise<Channel> {
    try {
      return this.channelService.createChannel({ ownerId: req.userId, ...createChannelDto });
    } catch (error) {

      throw new BadRequestException('Failed to create channel');
    }
  }


  @Delete(':channelId')
  async deleteChannel(
    @Param('channelId') channelId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {

    return this.channelService.deleteChannel(channelId, req.userId);
  }

}
