import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { ChannelGateway } from './channel.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Channel, ChannelSchema } from 'src/channel/schemas/channel.schema';
import { Message, MessageSchema } from 'src/message/schemas/message.schema';

@Module({
  imports: [

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelGateway],
  exports: [ChannelService, MongooseModule],  // Export  service to use it in other moduel
})
export class ChannelModule { }