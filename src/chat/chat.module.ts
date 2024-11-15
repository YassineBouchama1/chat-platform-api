import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Message, MessageSchema } from 'src/message/schemas/message.schema';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { ChatService } from './chat.service';
import { MessageService } from 'src/message/message.service';
import { MessageGateway } from 'src/message/message.gateway';
import { ChatGateway } from './chat.gateway';
import { CallGateway } from './call.gateway';

@Module({
  imports: [

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, MessageService, MessageGateway, ChatGateway, CallGateway],
  exports: [ChatService, MongooseModule],  // Export  service to use it in other moduel
})
export class ChatModule { }