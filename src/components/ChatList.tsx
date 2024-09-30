import { useQuery } from "convex/react"
import { usePathname } from "next/navigation"
import { FC } from "react"
import { api } from "../../convex/_generated/api"
import ChatListItem from "@/components/ChatListItem"

const ChatList:FC = () => {
  const pathName = usePathname()
  const chatId = pathName.split("/").pop()

  const converstions = useQuery(api.conversations.get)
  const groupMessages = converstions?.filter(msg => msg.conversation.isGroup);
  const directMessages  = converstions?.filter(msg => !msg.conversation.isGroup);

  const hasConversations = converstions && converstions.length > 0

  return (
    <div className="flex flex-col space-y-2">
      {hasConversations ? (
        <>
          {directMessages && directMessages.length > 0 && directMessages.map(({conversation, otherMember, unseenCount, lastMessage}) => (
            <ChatListItem 
              key={conversation._id} 
              name={otherMember?.username || ""}
              lastMessageContent={lastMessage?.lastMessageContent || ""}
              avatarURL={otherMember?.imageUrl || ""}
              chatID={conversation._id}
              isActive={chatId === conversation._id}
              unseenMessageCount={unseenCount}
              lastMessageSender={lastMessage?.lastMessageSender || ""}
              timeStamp={lastMessage?.lastMessageTime}
            />
          ))}

          {groupMessages && groupMessages.length > 0 && groupMessages.map(({conversation, unseenCount, lastMessage}) => (
            <ChatListItem 
              key={conversation._id}
              name={conversation.name || ""}
              lastMessageContent={lastMessage?.lastMessageContent || ""}
              avatarURL={""}
              chatID={conversation._id}
              isActive={chatId === conversation._id}
              unseenMessageCount={unseenCount}
              lastMessageSender={lastMessage?.lastMessageSender || ""}
              timeStamp={lastMessage?.lastMessageTime}
            />
          ))}
        </>
      ) : (
        <div className="text-center text-gray-500">
          No conversations found
        </div>
      )}
    </div>
  )
}
export default ChatList