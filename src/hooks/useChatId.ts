import { useParams } from "react-router";

const useChatId = () => {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId || null;
  return chatId;
};

export default useChatId;
