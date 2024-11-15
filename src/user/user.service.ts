import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {


  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(page: number, limit: number, userId: string): Promise<User[]> {
    const skip = (page - 1) * limit;


    const userIdObj = new Types.ObjectId(userId);
    // Retrieve usr 
    const users = await this.userModel
      .find({ _id: { $ne: userIdObj } }) // Exclude the provided me
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(50)
      .select("username email avatar status")
      .lean()
      .exec();

    return users
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
