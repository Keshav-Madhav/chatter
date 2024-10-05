import { Ban, Phone, Video } from "lucide-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { FC, useState } from "react"
import { toast } from "sonner"
import { ConvexError } from "convex/values"
import { Id } from "../../convex/_generated/dataModel"
import { SheetTitle } from "./ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import useMutationHandler from "@/hooks/useMutationHandler"
import ChatTypeContent from "./ChatTypeContent"
import { Button } from "./ui/button"

type actionProps = {
  Icon: FC;
  label: string;
}

const ActionButton = ({ Icon, label }: actionProps) => {
  return (
    <div className="flex space-y-2 flex-col items-center justify-center w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800">
      <Icon />
      <p className="text-xs ">{label}</p>
    </div>
  )
}

type Props = {
  chat_id: Id<"conversations">
  username: string;
  status: string;
  groupsInCommon: {
    conversation: {
      name?: string;
      isGroup: boolean;
      _creationTime: number;
      _id: Id<"conversations">;
    }
    unseenCount: number;
  }[] | undefined;
  chatAvatar: string;
}

const Profilesheet = ({ chat_id, username, status, groupsInCommon, chatAvatar }: Props) => {
  const [blockConfirmation, setBlockConfirmation] = useState(false)
  const messages = useQuery(api.messages.get, { Id: chat_id })
  const files = messages?.filter(msg => msg.type !== "text")
  const {mutate: blockContact, state: blockState} = useMutationHandler(api.contact.block)

  const blockUser = async () => {
    try {
      await blockContact({id: chat_id})
      toast.success(`${username} has been blocked`)
      setBlockConfirmation(false)
    } catch (error) {
      if(error instanceof ConvexError) {
        toast.error(error instanceof ConvexError ? error.message : "An error occurred")
      }
    }
  }

  return (
    <ScrollArea className="h-full ">
      <Avatar className="mx-auto size-20 mt-10">
        <AvatarImage src={chatAvatar} />
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Avatar>
      <SheetTitle className="text-center mt-2 text-2xl">{username}</SheetTitle>
      <p className="text-center">{status}</p>

      <div className="flex justify-center space-x-4 mt-5">
        <ActionButton Icon={Phone} label="Call" />
        <ActionButton Icon={Video} label="Video" />
      </div>

      <Separator className="my-5 border border-gray-100 dark:border-gray-800" />

      <Dialog open={blockConfirmation} onOpenChange={setBlockConfirmation}>
        <DialogTrigger className="w-full">
          <div className="flex items-center justify-center w-full text-red-600 space-x-3">
            <Ban />
            <p>Block</p>
          </div>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-5">Do you want to block {username}?</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            <p>You will no longer receive messages or calls from this contact.</p>
            <p>Your chat history will be deleted.</p>
            <p>To unblock, you will need to add {username} as friend again.</p>
          </DialogDescription>

          <DialogFooter className="flex items-center space-x-3">
            <Button
              onClick={blockUser}
              disabled={blockState === 'loading'}
              variant="destructive"
            >
              {blockState === 'loading' ? 'Blocking...' : 'Block'}
            </Button>
            <Button
              onClick={() => setBlockConfirmation(false)}
              disabled={blockState === 'loading'}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Separator className="my-5 border border-gray-100 dark:border-gray-800" />

      <div className="">
        <p className="font-bold text-lg my-5">Shared Media</p>
        {files && files.length > 0 ? (
          <ScrollArea className="rounded-md border max-w-80">
            <div className="flex space-x-4 p-4">
              {files.map(({type, content, _id}) => (
                <div key={_id} className="w-[200px] rounded-xl overflow-hidden">
                  <ChatTypeContent type={type} content={content} />
                </div>
              ))}
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ):(<p>No Media Shared</p>)}
      </div>

      <Separator className="my-5 border border-gray-100 dark:border-gray-800" />

      <div className="flex flex-col gap-y-2">
        <p className="font-bold text-lg">Groups in Common: <span>{groupsInCommon?.length || 'none'}</span></p>
        <div>
          {groupsInCommon && groupsInCommon.length > 0 && 
            groupsInCommon.map(({conversation, unseenCount}) => (
              <Link 
                href={`/chats/${conversation._id}`} 
                key={conversation._id} 
                className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-500 px-3 py-2 rounded-md border"
              >
                <Avatar>
                  <AvatarFallback>{conversation.name?.slice(0, 2) || 'G'}</AvatarFallback>
                </Avatar>

                <p className="text-sm">{conversation.name || 'Group'}</p>
              </Link>
            ))
          }
        </div>
      </div>
    </ScrollArea>
  )
}
export default Profilesheet