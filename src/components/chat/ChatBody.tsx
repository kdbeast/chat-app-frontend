/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChat } from "@/hooks/useChat";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import ChatBodyMessage from "./ChatBodyMessage";
import type { MessageType } from "@/types/chat.type";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
}
const ChatBody = ({ chatId, messages, onReply }: Props) => {
  const { socket } = useSocket();
  const { addNewMessage, addOrUpdateMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [_, setAiChunks] = useState<string>("");

  useEffect(() => {
    if (!chatId) return;
    if (!socket) return;

    const handleNewMessage = (msg: MessageType) => addNewMessage(chatId, msg);

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, chatId, addNewMessage]);

  useEffect(() => {
    if (!chatId) return;
    if (!socket) return;
    const handleAIStream = ({
      chatId: streamChatId,
      chunk,
      done,
      message,
    }: any) => {
      if (chatId !== streamChatId) return;
      const lastMsg = messages.at(-1);
      if (!lastMsg?._id && lastMsg?.streaming) return;

      if (chunk && chunk.trim() && !done) {
        setAiChunks((prev) => {
          const newContent = prev + chunk;
          addOrUpdateMessage(
            chatId,
            {
              ...lastMsg,
              content: newContent,
            } as MessageType,
            lastMsg?._id,
          );
          return newContent;
        });
        return;
      }

      if (done) {
        console.log("AI Stream Done 👨🏻‍💻", message);
        setAiChunks("");
      }
    };

    socket.on("chat:ai", handleAIStream);
    return () => {
      socket.off("chat:ai", handleAIStream);
    };
  }, [socket, chatId, messages, addOrUpdateMessage]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    const isStreaming = lastMsg?.streaming;

    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [messages]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col px-3 py-2">
      {messages.map((message) => (
        <ChatBodyMessage
          key={message._id}
          message={message}
          onReply={onReply}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBody;
