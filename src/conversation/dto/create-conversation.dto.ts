import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
    // @IsArray()
    // @IsNotEmpty()
    // participantIds: string[]; // Array of User IDs user  and user 


    @IsNotEmpty()
    withUser: string;  // id of user wnat start conversation with
    @IsString()
    message: string; //  here contain initial message content 
}
