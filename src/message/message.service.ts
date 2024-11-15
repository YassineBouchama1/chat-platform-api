import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { Chat, ChatDocument } from 'src/chat/schemas/chat.schema';
import { MessageGateway } from './message.gateway';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private messageGateway: MessageGateway, // Add this
  ) { }

  async sendMessage(chatId: string, createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
    const { content } = createMessageDto;


    const sender = new Types.ObjectId(userId); // sender is person who authed
    const chatIdObj = new Types.ObjectId(chatId); // sender is person who authed


    // if msg send for first time no need 
    // Find the chat 

    const chat = await this.chatModel.findById(chatIdObj).exec();
    if (!chat) throw new NotFoundException('Chat not found');


    // Check if the sender is a member of the chat
    if (!chat.members.includes(userId as any)) {
      throw new BadRequestException('User is not a member of the chat');
    }


    // Create and save the message
    const message = new this.messageModel({
      sender,
      content,
      chat: chatIdObj, // Associate the message with the chat
      type: 'text', // now is text type
    });
    await message.save();

    // Update the lastMessage field in the chat document
    chat.lastMessage = content;
    await chat.save();


    // After saving the message, populate the sender details
    const populatedMessage = await this.messageModel
      .findById(message._id)
      .populate({
        path: 'sender',
        select: 'username email avatar status',
        model: 'User'
      })
      .lean()
      .exec();

    // Emit the new message to all users in the chat
    this.messageGateway.server.to(chatId).emit('newMessage', {
      message: populatedMessage
    });

    return populatedMessage;
  }



  // this response for delete msg in both channel and conversation
  async deleteMessage(messageId: string, userId: string): Promise<void> {


    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.toString() !== userId) {
      throw new BadRequestException('User can only delete their own messages');
    }

    await this.messageModel.findByIdAndDelete(messageId);

  }



  // Fetch all messages for a given chat, along with chat and members details
  async getMessagesBelongChat(chatId: string, page: number, limit: number): Promise<Message[]> {
    const skip = (page - 1) * limit;
    const chatIdObj = new Types.ObjectId(chatId);


    // Retrieve messages with populated chat and members
    const messages = await this.messageModel
      .find({ chat: chatIdObj })
      // .sort({ createdAt: -1 })
      .skip(skip)
      .limit(50)

      .populate({
        path: 'sender',
        select: 'username email avatar status',
        model: 'User'
      })
      .lean()
      .exec();


    // if (!messages.length) {
    //   messages = []
    // }

    // Optionally, include chat details for response
    const chatDetails = await this.chatModel.findById(chatIdObj)
      // .select('name members createdAt updatedAt')
      .populate({
        path: 'members',
        select: 'username email avatar status ',
        model: 'User'
      })
      .lean()
      .exec();

    return messages
  }


}
