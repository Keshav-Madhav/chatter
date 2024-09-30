import { FC } from "react"
import Link from "next/link"
import { cn, getFormattedTimeStamp } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Props = {
  name: string
  lastMessageContent: string
  lastMessageSender: string
  timeStamp: number | undefined
  avatarURL: string
  isActive: boolean
  chatID: string
  unseenMessageCount: number
}

const ChatListItem: FC<Props> = ({name, lastMessageContent, lastMessageSender, timeStamp, avatarURL, isActive, chatID, unseenMessageCount}) => {

  return (
    <Link href={`/chats/${chatID}`} className={cn('p-3 rounded-2xl flex justify-between cursor-pointer',{'bg-gray-200 dark:bg-gray-800': isActive})}>
      <div className="flex space-x-3 ">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarURL} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center">
          <h2 className="font-bold">{name}</h2>
          {lastMessageContent && (
            <p className="text-sm text-gray-700 dark:text-gray-400">
              <span className="font-medium">{lastMessageSender}{lastMessageSender && ': '}</span>{lastMessageContent}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <p className="text-sm ">
          {timeStamp && getFormattedTimeStamp(timeStamp)}
        </p>

        {unseenMessageCount > 0 && (
          <Badge className="text-gray-500" variant="secondary">
            {unseenMessageCount}
          </Badge>
        )}
      </div>
    </Link>
  )
}
export default ChatListItem