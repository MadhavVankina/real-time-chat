import { connection } from "websocket";
import { OutgoingMessageType } from "../messages/OutgoingMessages";

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
    if (!this.room.get(roomId)) {
      this.room.set(roomId, {
        users: [],
      });
    }

    const room = this.room.get(roomId);

    if (!room) {
      console.log(roomId + " not found " + JSON.stringify(room));
      return;
    }

    room.users.push({
      id: userId,
      name,
      conn: socket,
    });

    const logRoom = {
      users: room.users.map(({ conn, ...rest }) => rest),
    };

    console.log(
      "RoomId " + roomId + " Users after add " + JSON.stringify(logRoom)
    );
  }

  getUser(userId: string, roomId: string) {
    console.log("GET USER params - User ID " + userId + " Room ID " + roomId);

    const room = this.room.get(roomId);
    console.log(
      JSON.stringify(
        "GET USER room found's - User Name" +
          JSON.stringify(room?.users.find(({ id }) => id === userId)?.name)
      )
    );

    if (!room) {
      console.log(room);
      console.log("Room not found in getUser");
      return;
    }

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
    const user = this.getUser(userId, roomId);

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
