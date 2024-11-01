
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4002, { cors: { origin: "*" } })
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private channels = new Map<string, Set<string>>(); // Track users in channels

    handleConnection(client: Socket) {
        console.log(`User connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`User disconnected: ${client.id}`);
        this.channels.forEach(users => users.delete(client.id)); // Remove user from all channels
    }

    // Direct message from user 1 to user 2
    @SubscribeMessage('sendDirectMessage')
    handleDirectMessage(client: Socket, { recipientId, message }: { recipientId: string, message: any }): void {
        
        this.server.to(`user_${recipientId}`).emit('receiveDirectMessage', { senderId: client.id, message });
        console.log(`User ${client.id} sent direct message to ${recipientId}`);
    }

    // Join a public or private channel
    @SubscribeMessage('joinChannel')
    handleJoinChannel(client: Socket, { channelId, isPrivate }: { channelId: string, isPrivate: boolean }): void {
        const roomName = isPrivate ? `private_${channelId}` : `public_${channelId}`;
        client.join(roomName);

        if (!this.channels.has(roomName)) {
            this.channels.set(roomName, new Set());
        }
        this.channels.get(roomName)?.add(client.id);

        console.log(`User ${client.id} joined ${isPrivate ? 'private' : 'public'} channel ${channelId}`);
    }

    // Leave a channel
    @SubscribeMessage('leaveChannel')
    handleLeaveChannel(client: Socket, { channelId, isPrivate }: { channelId: string, isPrivate: boolean }): void {
        const roomName = isPrivate ? `private_${channelId}` : `public_${channelId}`;
        client.leave(roomName);
        this.channels.get(roomName)?.delete(client.id);

        console.log(`User ${client.id} left ${isPrivate ? 'private' : 'public'} channel ${channelId}`);
    }

    // Send message to a specific channel
    @SubscribeMessage('sendChannelMessage')
    handleChannelMessage(client: Socket, { channelId, isPrivate, message }: { channelId: string, isPrivate: boolean, message: any }): void {
        const roomName = isPrivate ? `private_${channelId}` : `public_${channelId}`;
        client.to(roomName).emit('receiveChannelMessage', { senderId: client.id, message });
        console.log(`User ${client.id} sent message to ${roomName}`);
    }
}





// import {
//     SubscribeMessage,
//     WebSocketGateway,
//     WebSocketServer,
//     OnGatewayConnection,
//     OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway(4002, { cors: { origin: "*" } })
// export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
//     @WebSocketServer() server: Server;


//     handleConnection(client: Socket, ...args: any[]) {
//         console.log(`User connected: ${client.id}`);
//         client.broadcast.emit('receiveMessageGROUB');
//     }

//     handleDisconnect(client: Socket) {
//         console.log(`User disconnected: ${client.id}`);
//     }

//     @SubscribeMessage('publicChannel')
//     handleChannelPublicMessage(client: Socket, payload: any): void {

//         client.broadcast.emit('receiveMessageGROUB', payload); //send to all subcribers in this channel exept sender
//         // this.server.emit('receiveMessageGROUB', payload); //send to all subcribers in this channel
//     }


//     @SubscribeMessage('conversationsChannel')
//     handleChannelConversationMessage(client: Socket, payload: any): void {
//         client.emit('receiveMessageONE', payload); // this send t spicifec client in channel
//     }
// }