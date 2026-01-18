/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { UserType } from "@/types/auth.type";
import type {
  ChatType,
  CreateChatType,
  CreateMessageType,
  MessageType,
} from "@/types/chat.type";
import { API } from "@/lib/axiosClient";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { generateUUID } from "@/lib/Helper";

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

  fetchChats: () => void;
  fetchAllUsers: () => void;
  fetchSingleChat: (chatId: string) => void;
  sendMessage: (payload: CreateMessageType) => void;
  createChat: (payload: CreateChatType) => Promise<ChatType | null>;

  addNewChat: (newChat: ChatType) => void;
  addNewMessage: (chatId: string, message: MessageType) => void;
  updateChatLastMessage: (chatId: string, message: MessageType) => void;
}

export const useChat = create<ChatState>((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,

  isChatsLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,

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

  sendMessage: async (payload: CreateMessageType) => {
    const { chatId, replyTo, content, image } = payload;
    const { user } = useAuth.getState();
    if (!chatId || !user?._id) return;

    const tempMsgId = generateUUID();
    const tempMessage = {
      content: content || "",
      chatId,
      sender: user,
      _id: tempMsgId,
      replyTo: replyTo || null,
      image: image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "sending...",
    };
    set((state) => {
      if (state.singleChat?.chat._id === chatId) {
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...state.singleChat.messages, tempMessage],
          },
        };
      }
      return state;
    });

    try {
      const { data } = await API.post(`/chat/message/send`, {
        chatId,
        content,
        image,
        replyTo,
      });
      const { userMessage } = data;

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: state.singleChat.messages.map((msg) => {
              if (msg._id === tempMsgId) {
                return userMessage;
              }
              return msg;
            }),
          },
        };
      });

      // Also update the chat list's lastMessage
      get().updateChatLastMessage(chatId, userMessage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message");
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
}));
