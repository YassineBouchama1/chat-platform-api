import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
// import { MessageService } from 'src/message/message.service';
// import { CreateMessageDto } from 'src/message/dto/create-message.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // private messageService: MessageService,
  ) { }

  async createConversation(createConversationDto: CreateConversationDto, userId: string): Promise<Conversation> {
    const { withUser, message } = createConversationDto;


    // Check if users exist
    const userWantToTalkExist = await this.userModel.find({ _id: withUser });
    if (!userWantToTalkExist) {
      throw new NotFoundException(' user want start conversation with not found');
    }

    // create the new conversation
    const newConversation = new this.conversationModel({
      participants: [userId, withUser],
      messages: [], //  here i initialize with empty messages array
    });

    await newConversation.save();

    // send the initial message if content is provided
    if (message) {
      // const messageDto: CreateMessageDto = {
      //   sender: userId, //  the First participant index sends initial message
      //   content: message,
      // };

      // const messageCreated = await this.messageService.sendConversationMessage(
      //   newConversation._id.toString(),
      //   messageDto
      // );



    }

    return newConversation;
  }

  async getConversationById(id: string): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('participants', 'username email')
      .populate('messages')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }



  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'username email')
      .exec();
  }
}