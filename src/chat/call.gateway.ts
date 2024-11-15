
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../common/socket.middleware';
import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';

interface CallParticipant {
    userId: string;
    username: string;
    muted: boolean;
    videoOff: boolean;
}

interface CallRoom {
    type: 'video' | 'audio';
    participants: Map<string, CallParticipant>;
}

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true
    }
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private activeRooms: Map<string, Set<string>> = new Map();
    private userSocketMap: Map<string, string> = new Map();

    handleConnection(socket: AuthenticatedSocket) {
        if (socket.user) {
            this.userSocketMap.set(socket.user._id.toString(), socket.id);
            console.log('User connected:', socket.user._id.toString());
        }
    }

    handleDisconnect(socket: AuthenticatedSocket) {
        if (socket.user) {
            this.userSocketMap.delete(socket.user._id.toString());
            console.log('User disconnected:', socket.user._id.toString());
        }
    }

    @SubscribeMessage('joinCall')
    handleJoinCall(socket: AuthenticatedSocket, data: { chatId: string }) {
        const { chatId } = data;
        const userId = socket.user._id.toString();

        if (!this.activeRooms.has(chatId)) {
            this.activeRooms.set(chatId, new Set());
        }

        const room = this.activeRooms.get(chatId);
        room.add(userId);

        socket.join(`call-${chatId}`);

        // Notify others in the room about the new participant
        socket.to(`call-${chatId}`).emit('userJoined', {
            userId: userId,
            username: socket.user.username
        });

        // Send current participants to the joining user
        const participants = Array.from(room).map(participantId => ({
            userId: participantId,
            username: 'User ' + participantId // You might want to fetch actual usernames
        }));

        socket.emit('currentParticipants', { participants });

        console.log(`User ${userId} joined call ${chatId}`);
        return { participants };
    }

    @SubscribeMessage('offer')
    handleOffer(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        offer: RTCSessionDescriptionInit;
    }) {
        console.log('Handling offer from', socket.user._id.toString(), 'to', data.targetUserId);
        const targetSocketId = this.userSocketMap.get(data.targetUserId);

        if (targetSocketId) {
            this.server.to(targetSocketId).emit('offer', {
                offer: data.offer,
                userId: socket.user._id.toString()
            });
        }
    }

    @SubscribeMessage('answer')
    handleAnswer(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        answer: RTCSessionDescriptionInit;
    }) {
        console.log('Handling answer from', socket.user._id.toString(), 'to', data.targetUserId);
        const targetSocketId = this.userSocketMap.get(data.targetUserId);

        if (targetSocketId) {
            this.server.to(targetSocketId).emit('answer', {
                answer: data.answer,
                userId: socket.user._id.toString()
            });
        }
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        candidate: RTCIceCandidateInit;
    }) {
        console.log('Handling ICE candidate from', socket.user._id.toString(), 'to', data.targetUserId);
        const targetSocketId = this.userSocketMap.get(data.targetUserId);

        if (targetSocketId) {
            this.server.to(targetSocketId).emit('ice-candidate', {
                candidate: data.candidate,
                userId: socket.user._id.toString()
            });
        }
    }
}