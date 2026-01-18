import { useAuth } from "@/hooks/useAuth";
import useChatId from "@/hooks/useChatId";
import { useChat } from "@/hooks/useChat";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import EmptyState from "@/components/emptyState";
import { Spinner } from "@/components/ui/spinner";
import ChatBody from "@/components/chat/ChatBody";
import type { MessageType } from "@/types/chat.type";
import ChatHeader from "@/components/chat/ChatHeader";

const SingleChat = () => {
  const chatId = useChatId();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { fetchSingleChat, isSingleChatLoading, singleChat } = useChat();

  console.log("singleChat", singleChat);

  const [replyTo, setReplyTo] = useState<MessageType | null>(null);

  const currentUserId = user?._id || null;
  const chat = singleChat?.chat;
  const messages = singleChat?.messages || [];

  useEffect(() => {
    if (!chatId) return;
    fetchSingleChat(chatId);
  }, [fetchSingleChat, chatId]);

  //Socket Chat room
  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit("chat:join", chatId);
    return () => {
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket]);

  if (isSingleChatLoading || (chatId && !singleChat)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 text-primary!" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-svh flex flex-col">
      <ChatHeader chat={chat} currentUserId={currentUserId} />
      <div className="flex-1 overflow-y-auto bg-background">
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="No messages yet. Send the first message"
          />
        ) : (
          <ChatBody chatId={chatId} messages={messages} onReply={setReplyTo} />
        )}
      </div>

      {/* <ChatFooter
        replyTo={replyTo}
        chatId={chatId}
        currentUserId={currentUserId}
        onCancelReply={() => setReplyTo(null)}
      /> */}
    </div>
  );
};

export default SingleChat;
