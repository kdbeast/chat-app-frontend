/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type {
  ChatType,
  CreateChatType,
  CreateMessageType,
  MessageType,
} from "@/types/chat.type";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { API } from "@/lib/axiosClient";
import { generateUUID } from "@/lib/Helper";
import type { UserType } from "@/types/auth.type";

interface ChatState {
  chats: ChatType[];
  users: UserType[];
  singleChat: {
    chat: ChatType;
    messages: MessageType[];
  } | null;

  isChatsLoading: boolean;
  isUsersLoading: boolean;
  isCreatingChat: boolean;
  isSingleChatLoading: boolean;
  isSendingMessage: boolean;

  fetchChats: () => void;
  fetchAllUsers: () => void;
  fetchSingleChat: (chatId: string) => void;
  sendMessage: (payload: CreateMessageType, isAIChat?: boolean) => void;
  createChat: (payload: CreateChatType) => Promise<ChatType | null>;

  addNewChat: (newChat: ChatType) => void;
  addNewMessage: (chatId: string, message: MessageType) => void;
  updateChatLastMessage: (chatId: string, message: MessageType) => void;

  addOrUpdateMessage: (
    chatId: string,
    msg: MessageType,
    tempId?: string,
  ) => void;
}

export const useChat = create<ChatState>((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,

  isChatsLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,
  isSendingMessage: false,

  fetchAllUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await API.get("/user/all");
      set({ users: data.users, isUsersLoading: false });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  sendMessage: async (payload: CreateMessageType, isAIChat?: boolean) => {
    set({ isSendingMessage: true });
    const { user } = useAuth.getState();
    const chat = get().singleChat?.chat;
    const { chatId, replyTo, content, image } = payload;
    const aiSender = chat?.participants.find((p) => p.isAI);

    if (!chatId || !user?._id) return;

    const tempUserId = generateUUID();
    const tempAIId = generateUUID();

    const tempMessage = {
      content: content || "",
      chatId,
      sender: user,
      _id: tempUserId,
      replyTo: replyTo || null,
      image: image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: !isAIChat ? "sending..." : "",
    };
    get().addOrUpdateMessage(chatId, tempMessage, tempUserId);

    if (isAIChat && aiSender) {
      const tempAIMessage = {
        _id: tempAIId,
        content: "",
        chatId,
        sender: aiSender,
        replyTo: null,
        image: null,
        streaming: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "waiting...",
      };
      get().addOrUpdateMessage(chatId, tempAIMessage, tempAIId);
    }

    try {
      const { data } = await API.post(`/chat/message/send`, {
        chatId,
        content,
        image,
        replyToId: replyTo?._id,
      });

      const { userMessage, aiResponse } = data;

      get().addOrUpdateMessage(chatId, userMessage, tempUserId);

      if (isAIChat && aiResponse) {
        get().addOrUpdateMessage(chatId, aiResponse, tempAIId);
      }
    } catch (error: any) {
      console.log("Error occurred:", error);

      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  fetchChats: async () => {
    set({ isChatsLoading: true });
    try {
      const { data } = await API.get("/chat/all");
      set({ chats: data.chats, isChatsLoading: false });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isChatsLoading: false });
    }
  },

  createChat: async (payload: CreateChatType) => {
    set({ isCreatingChat: true });
    try {
      const response = await API.post("/chat/create", { ...payload });
      get().addNewChat(response.data.chat);
      toast.success("Chat created successfully");
      return response.data.chat;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create chat");
      return null;
    } finally {
      set({ isCreatingChat: false });
    }
  },

  fetchSingleChat: async (chatId: string) => {
    set({ isSingleChatLoading: true });
    try {
      const { data } = await API.get(`/chat/${chatId}`);
      set({ singleChat: data });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch chat");
    } finally {
      set({ isSingleChatLoading: false });
    }
  },

  addNewChat: (newChat: ChatType) => {
    set((state) => {
      const existingChatIndex = state.chats.findIndex(
        (chat) => chat._id === newChat._id,
      );
      if (existingChatIndex !== -1) {
        return {
          chats: [
            newChat,
            ...state.chats.filter((chat) => chat._id !== newChat._id),
          ],
        };
      }
      return { chats: [newChat, ...state.chats] };
    });
  },

  updateChatLastMessage: (chatId: string, lastMessage) => {
    set((state) => {
      const chat = state.chats.find((chat) => chat._id === chatId);
      if (chat) {
        return {
          chats: [
            {
              ...chat,
              lastMessage: lastMessage,
            },
            ...state.chats.filter((chat) => chat._id !== chatId),
          ],
        };
      }
      return { chats: [...state.chats] };
    });
  },

  addNewMessage: (chatId: string, message: MessageType) => {
    const chat = get().singleChat;
    if (chat?.chat._id === chatId) {
      set({
        singleChat: {
          chat: chat.chat,
          messages: [...chat.messages, message],
        },
      });
    }
    return { singleChat: null };
  },

  addOrUpdateMessage: (chatId: string, msg: MessageType, tempId?: string) => {
    const singleChat = get().singleChat;
    if (!singleChat || singleChat?.chat._id !== chatId) return;

    const messages = singleChat.messages;
    const messageIndex = messages.findIndex(
      (m) => m._id === tempId || m._id === msg._id,
    );

    let updatedMessages;
    if (messageIndex !== -1) {
      updatedMessages = messages.map((m, i) => (i === messageIndex ? msg : m));
    } else {
      updatedMessages = [...messages, msg];
    }

    set({ singleChat: { ...singleChat, messages: updatedMessages } });
  },
}));
