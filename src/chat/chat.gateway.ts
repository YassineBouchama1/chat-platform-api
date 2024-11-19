
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket, createSocketMiddleware } from 'src/common/socket.middleware';
import { User } from 'src/user/schemas/user.schema';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

    constructor(
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<User>,
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

    @SubscribeMessage('join:chat')
    handleJoinChat(client: Socket, chatId: string) {
        client.join(chatId);
    }

    @SubscribeMessage('leave:chat')
    handleLeaveChat(client: Socket, chatId: string) {
        client.leave(chatId);
    }





}