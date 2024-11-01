
import { FriendshipStatus } from '../schemas/friendship.schema';
import { IsEnum } from 'class-validator';

export class UpdateFriendshipStatusDto {
    @IsEnum(FriendshipStatus)
    status: FriendshipStatus;
}
