"use client"

import { ChevronLeft, Phone, Video } from "lucide-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

import { useSidebarWidth } from "@/hooks/useSidebarWidth"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Id } from "../../convex/_generated/dataModel"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"
import { useIsDesktop } from "@/hooks/useIsDesktop"
import Profilesheet from "./Profilesheet"

type Props = {
  chatAvatar: string;
  username: string;
  isGroup: boolean;
  chat_id: Id<"conversations">;
  status: string;
}

const ChatHeader = ({ chatAvatar, username, isGroup, chat_id, status }: Props) => {
  const { width } = useSidebarWidth()
  const isDesktop = useIsDesktop()
  const conversations = useQuery(api.conversations.get)
  const groupsInCommon = conversations?.filter(({conversation}) => conversation.isGroup)

  return (
    <div
      className={cn(
        'fixed bg-white dark:bg-gray-800 px-3 md:pr-10 flex items-center justify-between space-x-3 z-30 top-0 w-full h-20',
      )}
      style={isDesktop ? { width: `calc(100% - ${width + 3}%)` } : {}}
    >
      <div className="flex space-x-3">
        <div className="md:hidden">
          <Button asChild variant="outline" size="icon">
            <Link href="/chats">
              <ChevronLeft />
            </Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger className="flex items-center cursor-pointer space-x-4">
            <Avatar>
              <AvatarImage src={chatAvatar} />
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>

            <h2 className="text-lg font-bold">{username}</h2>
          </SheetTrigger>

          <SheetContent className="bg-white dark:bg-black dark:text-white w-80 md:w-96">
            {isGroup ? (
              <div>group</div>
            ):( 
              <Profilesheet
                chat_id={chat_id}
                username={username}
                status={status}
                groupsInCommon={groupsInCommon}
                chatAvatar={chatAvatar}
              /> 
            )}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center space-x-4">
        <Video />
        <Phone />
      </div>
    </div>
  )
}
export default ChatHeader