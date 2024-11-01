import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Friendship, FriendshipDocument, FriendshipStatus } from './schemas/friendship.schema';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipStatusDto } from './dto/update-friendship.dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(Friendship.name) private friendshipModel: Model<FriendshipDocument>,
  ) { }


  async sendFriendRequest(createFriendshipDto: CreateFriendshipDto): Promise<Friendship> {
    const { requester, recipient } = createFriendshipDto;

    // Check if a relationship already exists
    let friendship = await this.friendshipModel.findOne({ requester, recipient });
    if (!friendship) {
      friendship = new this.friendshipModel({ requester, recipient, status: FriendshipStatus.PENDING });
      await friendship.save();
    }
    return friendship;
  }


  async updateFriendshipStatus(id: string, updateStatusDto: UpdateFriendshipStatusDto): Promise<Friendship> {
    const friendship = await this.friendshipModel.findById(id);
    if (!friendship) throw new NotFoundException('Friendship not found');

    friendship.status = updateStatusDto.status;
    return friendship.save();
  }



  async getFriends(userId: string): Promise<Friendship[]> {
    return this.friendshipModel.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: FriendshipStatus.ACCEPTED,
    }).populate(['requester', 'recipient']);
  }



  async blockUser(requesterId: string, recipientId: string): Promise<Friendship> {
    let friendship = await this.friendshipModel.findOne({ requester: requesterId, recipient: recipientId });
    if (!friendship) {
      friendship = new this.friendshipModel({ requester: requesterId, recipient: recipientId, status: FriendshipStatus.BLOCKED });
    } else {
      friendship.status = FriendshipStatus.BLOCKED;
    }
    return friendship.save();
  }


}
