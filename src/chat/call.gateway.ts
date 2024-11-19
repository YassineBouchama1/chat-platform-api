
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../common/socket.middleware';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';

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
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }
    @WebSocketServer()
    server: Server;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
    private activeRooms: Map<string, Set<string>> = new Map();
    private userSocketMap: Map<string, string> = new Map();

    handleConnection(socket: AuthenticatedSocket) {
        if (socket.user) {
            this.userSocketMap.set(socket.user._id.toString(), socket.id);
            console.log('User connected:', socket.user._id.toString());
            // Broadcast to all clients that a user has connected
            this.server.emit('user:connected', { userId: socket.user._id.toString() });

        }
    }

    handleDisconnect(socket: AuthenticatedSocket) {
        if (socket.user) {
            this.userSocketMap.delete(socket.user._id.toString());
            console.log('User disconnected:', socket.user._id.toString());
            // Broadcast to all clients that a user has disconnected
            this.server.emit('user:disconnected', { userId: socket.user._id.toString() });
        }
    }



    @SubscribeMessage('initiateCall')
    async handleInitiateCall(socket: AuthenticatedSocket, data: {
        chatId: string,
        type: 'audio' | 'video'
    }) {
        const { chatId, type } = data;
        const callerId = socket.user._id.toString();
        const callerName = socket.user.username;

        // Get the chat document to check members
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat) {
            return { success: false, message: 'Chat not found' };
        }

        // Check if caller is a member of the chat
        if (!chat.members.some(member => member.toString() === callerId)) {
            return { success: false, message: 'Not a member of this chat' };
        }

        // Create a room for the chat if it doesn't exist
        if (!this.activeRooms.has(chatId)) {
            this.activeRooms.set(chatId, new Set());
        }

        // Add caller to active room
        this.activeRooms.get(chatId).add(callerId);

        // Emit incoming call event to all chat members except the caller
        for (const memberId of chat.members) {
            const memberIdString = memberId.toString();
            if (memberIdString !== callerId) {
                const targetSocketId = this.userSocketMap.get(memberIdString);
                if (targetSocketId) {
                    this.server.to(targetSocketId).emit('incomingCall', {
                        chatId,
                        callerId,
                        callerName,
                        type
                    });
                }
            }
        }

        return { success: true };
    }

    @SubscribeMessage('acceptCall')
    handleAcceptCall(socket: AuthenticatedSocket, data: {
        chatId: string,
        callerId: string
    }) {
        const { chatId, callerId } = data;
        const accepterId = socket.user._id.toString();

        // Notify caller that the call was accepted
        const callerSocketId = this.userSocketMap.get(callerId);
        if (callerSocketId) {
            this.server.to(callerSocketId).emit('callAccepted', {
                userId: accepterId,
                username: socket.user.username
            });
        }

        // Add accepter to active room
        if (!this.activeRooms.has(chatId)) {
            this.activeRooms.set(chatId, new Set());
        }
        this.activeRooms.get(chatId).add(accepterId);

        return { success: true };
    }

    @SubscribeMessage('rejectCall')
    handleRejectCall(socket: AuthenticatedSocket, data: {
        chatId: string,
        callerId: string
    }) {
        const { chatId, callerId } = data;
        const rejecterId = socket.user._id.toString();

        // Notify caller that the call was rejected
        const callerSocketId = this.userSocketMap.get(callerId);
        if (callerSocketId) {
            this.server.to(callerSocketId).emit('callRejected', {
                userId: rejecterId,
                username: socket.user.username
            });
        }

        return { success: true };
    }

    @SubscribeMessage('leaveCall')
    handleLeaveCall(socket: AuthenticatedSocket, data: { chatId: string }) {
        const { chatId } = data;
        const userId = socket.user._id.toString();

        // Remove user from active room
        const room = this.activeRooms.get(chatId);
        if (room) {
            room.delete(userId);
            if (room.size === 0) {
                this.activeRooms.delete(chatId);
            }
        }

        // Notify others that user left
        socket.to(`call-${chatId}`).emit('userLeft', {
            userId: userId
        });

        socket.leave(`call-${chatId}`);
        return { success: true };
    }

    @SubscribeMessage('joinCall')
    async handleJoinCall(socket: AuthenticatedSocket, data: { chatId: string }) {
        const { chatId } = data;
        const userId = socket.user._id.toString();

        // Verify chat membership
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat || !chat.members.some(member => member.toString() === userId)) {
            return { success: false, message: 'Not authorized to join this call' };
        }

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

        // Get actual usernames from the database
        const participantIds = Array.from(room);
        const participants = await this.getUsersInfo(participantIds);

        socket.emit('currentParticipants', { participants });

        return { success: true, participants };
    }

    // Helper method to get users information
    private async getUsersInfo(userIds: string[]) {
        const users = await this.userModel.find({
            _id: { $in: userIds }
        }).select('username _id').exec();

        return users.map(user => ({
            userId: user._id.toString(),
            username: user.username
        }));
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


