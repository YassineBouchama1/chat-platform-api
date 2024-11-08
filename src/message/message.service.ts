import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(createMessageDto);
    return message.save();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel
      .find()
      .populate('sender readBy channel conversation')
      .exec();
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageModel
      .findById(id)
      .populate('sender readBy channel conversation')
      .exec();
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const updateMessage = await this.messageModel
      .findByIdAndUpdate(id, updateMessageDto, { new: true })
      .exec();
    if (!updateMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return updateMessage;
  }
  async remove(id: string): Promise<void> {
    const result = await this.messageModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
