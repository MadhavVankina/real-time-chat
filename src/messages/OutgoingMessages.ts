export enum SupportedMessage {
  AddChat = "ADD_CHAT",
  UpdateChat = "UPDATE_CHAT",
  UpvoteMessage = "UPVOTE_MESSAGE",
}

type AddChatType = {
  userId: string;
  roomId: String;
  message: string;
  name: string;
  upvotes: number;
  chatId: string;
};

export type OutgoingMessageType =
  | {
      type: SupportedMessage.AddChat;
      payload: AddChatType;
    }
  | {
      type: SupportedMessage.UpdateChat;
      payload: Partial<AddChatType>;
    };
