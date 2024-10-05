import { Ban, Phone, Trash2, Video } from "lucide-react"
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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/dialog"
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
  groupname: string;
}

const GroupSheet = ({ chat_id, groupname }: Props) => {
  const [deleteConversation, setDeleteConversation] = useState(false)
  const [leaveConversation, setLeaveConversation] = useState(false)

  const members = useQuery(api.conversation.getConversationMembers, { id: chat_id })
  const messages = useQuery(api.messages.get, { Id: chat_id })
  const files = messages?.filter(msg => msg.type !== "text")

  const {mutate: deleteGroup, state: deletestate} = useMutationHandler(api.conversation.deleteGroup)
  const {mutate: leavegroup, state: leaveState} = useMutationHandler(api.conversation.leaveGroup)
  const {mutate: sendFriendRequest, state: updateRequestSendStatus} = useMutationHandler(api.friend_request.create)

  const deleteGroupHandler = async () => {
    try {
      await deleteGroup({id: chat_id})
      toast.success(`${groupname} has been deleted`)
      setDeleteConversation(false)
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.message : "An error occurred")
    }
  }

  const leaveGroupHandler = async () => {
    try {
      await leavegroup({id: chat_id})
      toast.success(`You have left ${groupname}`)
      setLeaveConversation(false)
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.message : "An error occurred")
    }
  }

  const handleFriendRequest = async (email: string) => {
    console.log('email', email)
    try {
      await sendFriendRequest({email})
      toast.success('Friend request sent successfully',{
        description: `Request sent to ${email}`
      });
    } catch (error) {
      toast.error('An error occurred',{
        description: error instanceof ConvexError && error.data
      });
      console.error('Error sending friend request', error)
    }
  }

  return (
    <ScrollArea className="h-full ">
      <Avatar className="mx-auto size-20 mt-10">
        <AvatarFallback>{groupname.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <SheetTitle className="text-center mt-2 text-2xl">{groupname}</SheetTitle>

      <div className="flex justify-center space-x-4 mt-5">
        <ActionButton Icon={Phone} label="Call" />
        <ActionButton Icon={Video} label="Video" />
      </div>

      <Separator className="my-5 border border-gray-100 dark:border-gray-800" />

      <div className="flex gap-2 items-center">
        <Dialog open={leaveConversation} onOpenChange={setLeaveConversation}>
          <DialogTrigger className="flex-1">
            <div className="flex items-center justify-center w-full text-red-600 space-x-3">
              <Ban />
              <p>Leave</p>
            </div>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-5">Do you want to leave {groupname}?</DialogTitle>
            </DialogHeader>

            <DialogDescription>
              <p>You will no longer receive messages or calls from this group.</p>
              <p>Yous access to chat history will be removed.</p>
              <p>To access, you will need to add to be added to the group again.</p>
            </DialogDescription>

            <DialogFooter className="flex items-center space-x-3">
              <Button
                onClick={leaveGroupHandler}
                disabled={leaveState === 'loading'}
                variant="destructive"
              >
                {leaveState === 'loading' ? 'Leaving...' : 'Leave'}
              </Button>
              <Button
                onClick={() => setLeaveConversation(false)}
                disabled={leaveState === 'loading'}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConversation} onOpenChange={setDeleteConversation}>
          <DialogTrigger className="flex-1">
            <div className="flex items-center justify-center w-full text-red-600 space-x-3">
              <Trash2 />
              <p>Delete</p>
            </div>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-5">Do you want to delete the group {groupname}?</DialogTitle>
            </DialogHeader>

            <DialogDescription>
              <p>The group will be deleted and all members will be removed.</p>
              <p>Messages and media shared will be deleted.</p>
              <p>Group will be removed from your chat list.</p>
            </DialogDescription>

            <DialogFooter className="flex items-center space-x-3">
              <Button
                onClick={deleteGroupHandler}
                disabled={deletestate === 'loading'}
                variant="destructive"
              >
                {deletestate === 'loading' ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                onClick={() => setDeleteConversation(false)}
                disabled={deletestate === 'loading'}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="my-5 border border-gray-100 dark:border-gray-800" />

      <div className="">
        <p className="font-bold text-lg my-5">Group Members ({members?.members.length})</p>

        {members?.members && members.members.length > 0 && members.members.map((member) => (
          <Dialog key={member._id}>
            <DialogTrigger>
              <div className="w-full flex items-center space-x-3 my-3">
                <Avatar className="size-10">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback>{member.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <p>{member.username}</p>
                  <p className="text-xs truncate">{member.email}</p>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mb-5">Send Friend Request to {member.username}</DialogTitle>
              </DialogHeader>

              <DialogFooter className="flex items-center space-x-3">
                <Button
                  onClick={()=> handleFriendRequest(member.email)}
                  disabled={updateRequestSendStatus === 'loading'}
                >
                  {updateRequestSendStatus === 'loading' ? 'Sending...' : 'Send Request'}
                </Button>
                <DialogClose
                  disabled={updateRequestSendStatus === 'loading'}
                >
                  Cancel
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>

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
    </ScrollArea>
  )
}
export default GroupSheet