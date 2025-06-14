import { connection } from "websocket";
import { OutgoingMessageType } from "../messages/OutGoingMessages";

interface User {
  name: string;
  id: string;
  conn: connection;
}

interface Room {
  users: User[];
}

export class UserManager {
  private room: Map<string, Room>;

  constructor() {
    this.room = new Map<string, Room>();
  }

  addUser(name: string, userId: string, roomId: string, socket: connection) {
    const room = this.room.get(roomId);

    if (!room) return;

    room.users.push({
      id: userId,
      name,
      conn: socket,
    });
  }

  getUser(userId: string, roomId: string) {
    const room = this.room.get(roomId);

    if (!room) return;

    const user = room.users.find(({ id }) => id === userId);
    if (!user) return;
    return user;
  }

  removeUser(userId: string, roomId: string) {
    const room = this.room.get(roomId);

    if (!room) return;

    room.users = room.users.filter(({ id }) => id !== userId);
  }

  broadcast(roomId: string, userId: string, message: OutgoingMessageType) {
    const user = this.getUser(roomId, userId);

    if (!user) {
      console.error("User not found");
      return;
    }

    const room = this.room.get(roomId);

    if (!room) {
      console.error("Room not found");
      return;
    }

    room.users.forEach(({ conn }) => {
      conn.sendUTF(JSON.stringify(message));
    });
  }
}
