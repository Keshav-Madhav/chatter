import useMutationHandler from "@/hooks/useMutationHandler"
import { Id } from "../../convex/_generated/dataModel"
import { api } from "../../convex/_generated/api"
import { toast } from "sonner"
import { ConvexError } from "convex/values"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Check, X } from "lucide-react"

type Props = {
  id: Id<'friend_requests'>
  imageUrl: string
  username: string
  email: string
}

const FriendRequestCard = ({id, imageUrl, username, email}: Props) => {
  const {mutate: acceptFriendRequest, state: acceptState}= useMutationHandler(api.friend_request.accept)
  const {mutate: declineFriendRequest, state: declineState}= useMutationHandler(api.friend_request.decline)

  const handleAccept = async () => {
    try {
      await acceptFriendRequest({requestId: id})      
      toast.success('Friend request accepted successfully')
    } catch (error) {
      console.error('Error accepting friend request', error)
      toast.error('An error occurred',{
        description: error instanceof ConvexError && error.data
      })
    }
  }

  const handleDecline = async () => {
    try {
      await declineFriendRequest({requestId: id})     
      toast.success('Friend request declined successfully')
    } catch (error) {
      console.error('Error accepting friend request', error)
      toast.error('An error occurred',{
        description: error instanceof ConvexError && error.data
      })
    }
  }

  return (
    <div className="flex items-center space-x-4 rounded-md border border-gray-500 p-4">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={imageUrl} alt={username}/>
          <AvatarFallback>{username.slice(0,1)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="w-full flex-col">
        <p className="text-sm font-medium leading-none">{username}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[15rem]">{email}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="default"
          disabled={acceptState === 'loading' || declineState === 'loading'}
          onClick={handleAccept}
        >
          <Check/>
        </Button>

        <Button
          size="icon"
          variant="destructive"
          disabled={acceptState === 'loading' || declineState === 'loading'}
          onClick={handleDecline}
        >
          <X/>
        </Button>
      </div>
    </div>
  )
}
export default FriendRequestCard