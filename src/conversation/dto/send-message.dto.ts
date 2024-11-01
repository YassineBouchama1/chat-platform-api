import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  senderId: string; // ID of the user sending the message

  @IsNotEmpty()
  @IsString()
  content: string; // Message content
}
