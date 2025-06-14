import { connection, server as WebSocketServer } from "websocket";
import * as http from "http";
import {
  IncomingMessageType,
  SupportedMessage,
} from "./messages/IncomingMessages";
import {
  OutgoingMessageType,
  SupportedMessage as OutgoingSupportedMessage,
} from "./messages/OutGoingMessages";
import { UserManager } from "./store/UserManager";
import { InMemoryStore } from "./InMemoryStore";

var server = http.createServer(function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

const userManager = new UserManager();
const store = new InMemoryStore();

server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});

const wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false,
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  var connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");
  connection.on("message", function (message) {
    // TODO - Add rate limiter here
    if (message.type === "utf8") {
      try {
        messageHandler(connection, JSON.parse(message.utf8Data));
      } catch (e) {}
      //   console.log("Received Message: " + message.utf8Data);
      //   connection.sendUTF(message.utf8Data);
    } else if (message.type === "binary") {
      console.log(
        "Received Binary Message of " + message.binaryData.length + " bytes"
      );
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});

function messageHandler(ws: connection, message: IncomingMessageType) {
  if (message.type === SupportedMessage.JoinRoom) {
    const payload = message.payload;
    userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
  }

  if (message.type === SupportedMessage.SendMessage) {
    const payload = message.payload;
    const user = userManager.getUser(payload.userId, payload.roomId);
    if (!user) {
      console.error("User not found");
      return;
    }
    const chat = store.addchat(
      payload.userId,
      user.name,
      payload.roomId,
      payload.message
    );

    if (!chat) return;
    const outgoingPayload: OutgoingMessageType = {
      type: OutgoingSupportedMessage.AddChat,
      payload: {
        chatId: chat?.id,
        roomId: payload.roomId,
        message: payload.message,
        name: user.name,
        upvotes: chat.upvotes.length,
      },
    };

    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }

  if (message.type === SupportedMessage.UpvoteMessage) {
    const payload = message.payload;
    const chat = store.upvote(payload.userId, payload.roomId, payload.chatId);

    if (!chat) return;

    const outgoingPayload: OutgoingMessageType = {
      type: OutgoingSupportedMessage.UpdateChat,
      payload: {
        chatId: payload.chatId,
        roomId: payload.roomId,
        upvotes: chat.upvotes.length,
      },
    };

    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
}
