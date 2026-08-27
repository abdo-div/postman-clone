import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env.config.js';

let io: Server | null = null;

export const initSocketServer = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join a specific job room to receive isolated live progress updates
    socket.on('join-runner-job', (jobId: string) => {
      socket.join(`job:${jobId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room: job:${jobId}`);
    });

    socket.on('leave-runner-job', (jobId: string) => {
      socket.leave(`job:${jobId}`);
      console.log(`[Socket.io] Socket ${socket.id} left room: job:${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketServer = (): Server => {
  if (!io) {
    throw new Error('Socket.io server has not been initialized!');
  }
  return io;
};