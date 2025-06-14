import z from "zod";

export enum SupportedMessage {
  JoinRoom = "JOIN_ROOM",
  SendMessage = "SEND_MESSAGE",
  UpvoteMessage = "UPVOTE_MESSAGE",
}

export type IncomingMessageType =
  | {
      type: SupportedMessage.JoinRoom;
      payload: InitMessageType;
    }
  | {
      type: SupportedMessage.SendMessage;
      payload: UserMessageType;
    }
  | {
      type: SupportedMessage.UpvoteMessage;
      payload: UpvoteMessageType;
    };

const initMessage = z.object({
  name: z.string(),
  userId: z.string(),
  roomId: z.string(),
});

const userMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  message: z.string(),
});

const upvoteMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  chatId: z.string(),
});

export type InitMessageType = z.infer<typeof initMessage>;
export type UserMessageType = z.infer<typeof userMessage>;
export type UpvoteMessageType = z.infer<typeof upvoteMessage>;
