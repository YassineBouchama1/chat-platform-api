import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel, ChannelDocument } from 'src/channel/schemas/channel.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { CreateChannelDto } from './dto/create-channel.dto';


@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }


  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {



    const { name, type, isPrivate, isSafeMode, ownerId } = createChannelDto;

    // no need fetch already fetched userwner from auth guard
    // const owner = await this.userModel.findById(ownerId);
    // if (!owner) throw new NotFoundException('Owner not found');

    // Create the new channel
    const newChannel = new this.channelModel({
      name,
      type,
      isPrivate,
      isSafeMode,
      owner: ownerId,
      members: [ownerId]  // Automatically add owner to members 
    });

    // Save the channel 
    await newChannel.save();


    return newChannel;


  }



  // This Method for joining a channel
  async joinChannel(userId: string, channelId: string): Promise<Channel> {


    // fetch channel by id & chck if xist
    const channel = await this.channelModel.findById(channelId);
    if (!channel) throw new NotFoundException('Channel not found');

    // fetch user by id & chck if exist
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // check if this user already  in channel
    if (!channel.members.includes(userId as any)) {
      channel.members.push(userId as any);
      await channel.save();

    }

    return channel;

  }



  async deleteChannel(channelId: string, userId: string): Promise<void> {


    const channel = await this.channelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.owner.toString() !== userId) {
      throw new BadRequestException('User can only delete their own channel');
    }

    await this.channelModel.findByIdAndDelete(channelId);


    throw new BadRequestException('Failed to Delete channel');
  }

}
