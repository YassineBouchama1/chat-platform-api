import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post()
  async sendNotification(@Body() notificationDto: NotificationDto) {
    return this.notificationService.sendNotification(notificationDto);
  }
  @Get()
  async getUserNotifications(@Query('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }
}
