
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Chat } from '../chat/schemas/chat.schema';
import { AuthenticatedSocket, createSocketMiddleware } from '../common/socket.middleware';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    constructor(
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
    ) { }

    afterInit(server: Server) {
        const middleware = createSocketMiddleware(this.jwtService, this.userModel);
        server.use(middleware);
    }

    async handleConnection(client: AuthenticatedSocket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.connectedUsers.set(client.id, userId);
            client.broadcast.emit('user:connected', { userId });
        }
    }

    async handleDisconnect(client: AuthenticatedSocket) {
        const userId = this.connectedUsers.get(client.id);
        if (userId) {
            this.connectedUsers.delete(client.id);
            client.broadcast.emit('user:disconnected', { userId });
        }
    }

    @SubscribeMessage('joinChat')
    async handleJoinChat(socket: AuthenticatedSocket, chatId: string) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat) return;

        const userId = socket.user._id
        if (!chat.members.includes(userId)) return;

        socket.join(chatId);

        // Notify other chat members
        socket.to(chatId).emit('userJoinedChat', {
            chatId,
            userId,
            username: socket.user.username
        });
    }



    @SubscribeMessage('leaveChat')
    async handleLeaveChat(socket: AuthenticatedSocket, chatId: string) {
        socket.leave(chatId);

        // Notify other chat members
        socket.to(chatId).emit('userLeftChat', {
            chatId,
            userId: socket.user._id.toString(),
            username: socket.user.username
        });
    }

    // Helper method to check if a user is online
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    // Helper method to get all online users in a chat
    async getOnlineUsersInChat(chatId: string): Promise<string[]> {
        const sockets = await this.server.in(chatId).fetchSockets();
        return sockets.map(socket => (socket as unknown as AuthenticatedSocket).user._id.toString());
    }
}

