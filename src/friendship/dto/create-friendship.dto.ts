import { IsMongoId } from 'class-validator';

export class CreateFriendshipDto {
    @IsMongoId()
    requester: string;

    @IsMongoId()
    recipient: string;
}
