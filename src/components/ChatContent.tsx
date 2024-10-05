"use client"

import { useQuery } from "convex/react"
import { Id } from "../../convex/_generated/dataModel"
import { api } from "../../convex/_generated/api"
import useMutationHandler from "@/hooks/useMutationHandler"
import { useUser } from "@clerk/clerk-react"
import ChatHeader from "./ChatHeader"

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

  return (
    <div className="h-full flex">
      <ChatHeader chatAvatar={chatAvatar} username={name} isGroup={conversation.isGroup} chat_id={chat_id} status={status} />
    </div>
  )
}
export default ChatContent