"use client"

import { useQuery } from "convex/react"
import { Id } from "../../convex/_generated/dataModel"
import { api } from "../../convex/_generated/api"
import useMutationHandler from "@/hooks/useMutationHandler"
import { useUser } from "@clerk/clerk-react"
import ChatHeader from "./ChatHeader"
import MessageItem from "./MessageItem"
import { useEffect } from "react"
import ChatFooter from "./ChatFooter"

type Props = {
  chat_id: Id<"conversations">
}

const ChatContent = ({ chat_id }: Props) => {
  const conversation = useQuery(api.conversation.get, { id: chat_id })
  const messages = useQuery(api.messages.get, { Id: chat_id })
  const {mutate: markAsRead} = useMutationHandler(api.conversation.markAsRead)
  const {user} = useUser();

  if(!conversation || !messages) return null;

  const members =  conversation.isGroup ? conversation.otherMembers ?? [] : conversation.otherMember ? [conversation.otherMember] : []
  const chatAvatar = conversation.otherMember?.imageUrl || '';
  const name = conversation.isGroup ? conversation.name || '' : conversation.otherMember?.username || '';
  const status = conversation.otherMember?.status || '';

  const getSeenMessage = (messageId: Id<"messages">) => {
    const seenUsers = members.filter(member => member.lastSeenMessageId === messageId).map(member => member.username?.split(' ')[0])

    if(seenUsers.length === 0) return undefined

    return formatSeenBy(seenUsers)
  }

  const formatSeenBy = (seenUsers: (string | undefined)[]) => {
    switch(seenUsers.length){
      case 1:
        return `${seenUsers[0]} seen`
      case 2:
        return `${seenUsers[0]} and ${seenUsers[1]} seen`
      case 3:
        return `${seenUsers[0]}, ${seenUsers[1]} and ${seenUsers[2]} seen`
      default:
        return `${seenUsers[0]}, ${seenUsers[1]} and ${seenUsers.length - 2} others seen`
    }
  }

  useEffect(() => {
    if(messages.length > 0){
      markAsRead({conversationId: chat_id, messageId: messages[0]._id})
    }
  }, [chat_id, markAsRead, messages])

  return (
    <div className="h-full flex">
      <ChatHeader chatAvatar={chatAvatar} username={name} isGroup={conversation.isGroup} chat_id={chat_id} status={status} />

      <div className="p-3 flex flex-1 flex-col-reverse gap-2">
        {messages.map((message, index) => (
          <MessageItem
            key={index}
            fromCurrentUser={message.isCurrentUser}
            senderImage={message.senderImage}
            senderName={message.sendName}
            lastByUser={messages[index - 1]?.senderId === message.senderId}
            content={message.content}
            createdAt={message._creationTime}
            type={message.type}
            seen={message.isCurrentUser ? getSeenMessage(message._id) : undefined}
          />
        ))}
      </div>

      <ChatFooter 
        chat_id={chat_id}
        currUserId={user?.id!}
      />
    </div>
  )
}
export default ChatContent