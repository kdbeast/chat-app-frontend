/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { UserType } from "@/types/auth.type";
import type { ChatType, CreateChatType, MessageType } from "@/types/chat.type";
import { API } from "@/lib/axiosClient";
import { toast } from "sonner";

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
  createChat: (payload: CreateChatType) => Promise<ChatType | null>;
  updateChatLastMessage: (chatId: string, message: MessageType) => void;
  
  addNewChat: (newChat: ChatType) => void;
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
      set({ singleChat: data.chat, isSingleChatLoading: false });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch chat");
    } finally {
      set({ isSingleChatLoading: false });
    }
  },

  addNewChat: (newChat: ChatType) => {
    set((state) => {
      const existingChatIndex = state.chats.findIndex(
        (chat) => chat._id === newChat._id
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

  updateChatLastMessage: (chatId: string, message: MessageType) => {
    set((state) => {
      const existingChatIndex = state.chats.findIndex(
        (chat) => chat._id === chatId
      );
      if (existingChatIndex !== -1) {
        return {
          chats: [
            {
              ...state.chats[existingChatIndex],
              lastMessage: message,
            },
            ...state.chats.filter((chat) => chat._id !== chatId),
          ],
        };
      }
      return { chats: [state.chats[0], ...state.chats] };
    });
  },
}));
