import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationDto } from './dto/notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  async sendNotification(notificationDto: NotificationDto) {
    const notification = new this.notificationModel(notificationDto);
    const savedNotification = await notification.save();
    this.notificationGateway.sendNotificationToUser(
      notificationDto.recipientId,
      savedNotification,
    );
    return savedNotification;
  }
  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ recipientId: userId })
      .sort({ createdAt: -1 });
  }
}