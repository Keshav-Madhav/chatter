import { useTheme } from "next-themes"
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Handshake, LaptopMinimal, Pencil, Sun, SunMoon, UserRound, UserRoundSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserButton, useUser } from "@clerk/clerk-react";
import useMutationHandler from "@/hooks/useMutationHandler";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import FriendRequestCard from "./FriendRequestCard";

const status  = [
  '💆 Taking a break',
  '✍️ Working',
  '👽 Missing',
  '😴 Sleeping',
  '👋 Free to chat',
]

type Props = {}

const ProfileDialogContent = (props: Props) => {
  const [openStatus, setOpenStatus] = useState(false);
  const [openFriendRequest, setOpenFriendRequest] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  
  const {theme, setTheme} = useTheme();
  const { user } = useUser();
  const userDetails = useQuery(api.status.get, {
    clerkId: user?.id!
  })

  const {mutate: updatestatus, state: updatestatusState} = useMutationHandler(api.status.update)
  const {mutate: sendFriendRequest, state: updateRequestSendStatus} = useMutationHandler(api.friend_request.create)
  const friendRequests = useQuery(api.friend_requests.get)

  const addFriendFormSchema = z.object({
    email: z.string().email().min(1, {message: 'Email is required'}),
  })

  const form = useForm<z.infer<typeof addFriendFormSchema>>({
    resolver: zodResolver(addFriendFormSchema),
    defaultValues:{
      email: '',
    }
  })

  const handleFriendRequest = async ({email}: z.infer<typeof addFriendFormSchema>) => {
    try {
      await sendFriendRequest({email})
      toast.success('Friend request sent successfully',{
        description: `Request sent to ${email}`
      });
      form.reset()
      setOpenFriendRequest(false)
    } catch (error) {
      toast.error('An error occurred',{
        description: error instanceof ConvexError && error.data
      });
      console.error('Error sending friend request', error)
    }
  }

  const updateStatusHandler = async () => {
    try {
      await updatestatus({
        status: userStatus,
        clerkId: user?.id!
      })
      toast.success('Status updated successfully');
      setUserStatus("")
      setOpenStatus(false)
    } catch (error) {
      console.error('Error updating status', error)
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  }

  return (
    <div>
      <Card className="border-0 flex flex-col space-y-4 bg-transparent">
        <CardTitle className="dark:text-white text-gray-950">Profile</CardTitle>
        <div className="w-fit mx-auto">
          <UserButton 
            appearance={{
              elements:{
                userButtonPopoverCard:{
                  pointerEvents: 'initial',
                },
                userButtonAvatarBox: "h-20 w-20",
              },
            }}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-y-6 mt-4">
        <div className="flex items-center space-x-2">
          <UserRound/>
          <Input
            disabled
            placeholder="Name"
            value={userDetails?.username}
            className="border-none outline-none ring-0"
          />
        </div>

        <Separator/>

        <Dialog onOpenChange={setOpenFriendRequest} open={openFriendRequest}>
          <DialogTrigger>
            <div className="flex items-center space-x-2">
              <UserRoundSearch/>
              <p>Send friend request</p>
            </div>
          </DialogTrigger>

          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFriendRequest)} className="space-y-8">
                <FormField control={form.control} name="email" render={({field})=>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={updateRequestSendStatus === 'loading'}
                        {...field} 
                        placeholder="friend@email.com" 
                      />
                    </FormControl>

                    <FormDescription>
                      Add a friend by entering their email address
                    </FormDescription>

                    <FormMessage/>
                  </FormItem>
                }/>

                <Button 
                  disabled={updateRequestSendStatus === 'loading'}
                  type="submit"
                >
                  Send friend request
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Separator/>

        <Dialog>
          <DialogTrigger>
            <div className="flex items-center space-x-2">
              <Handshake/>
              <p>View friend request</p>
              {friendRequests && (
                <Badge variant="outline">{friendRequests.length}</Badge>
              )}
            </div>
          </DialogTrigger>

          <DialogContent>
            {friendRequests && friendRequests.length > 0 ? (
              <ScrollArea className="max-h-[400px] rounded-md">
                {friendRequests.map((request, index) => (
                  <FriendRequestCard
                    key={index} 
                    id={request._id}
                    imageUrl={request.sender.imageUrl}
                    username={request.sender.username}
                    email={request.sender.email}
                  />
                ))}
              </ScrollArea>
            ):(
              <p className="text-xl text-center font-bold">No friend requests.</p>
            )}
          </DialogContent>
        </Dialog>

        <Separator/>

        <Dialog
          onOpenChange={setOpenStatus}
          open={openStatus}
        >
          <DialogTrigger>
            <div className="flex items-center space-x-2">
              <Pencil/>
              <p>{userDetails?.status}</p>
            </div>
          </DialogTrigger>

          <DialogContent>
            <Textarea 
              placeholder={userDetails?.status}
              className="resize-none h-48"
              value={userStatus}
              onChange={(e)=> setUserStatus(e.target.value)}
              disabled={updatestatusState === 'loading'}
            />

            <div className="flex flex-wrap gap-1">
              {status.map((item, index) => (
                <p 
                  key={index} 
                  className="flex-1 whitespace-nowrap px-5 py-2 text-center border border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                  onClick={()=> {
                    setUserStatus(item)
                  }}
                >
                  {item}
                </p>
              ))}
            </div>

            <Button
              onClick={updateStatusHandler}
              disabled={updatestatusState === 'loading'}
              type="button"
              className="ml-auto w-fit bg-primary-main"
            >
              Update status
            </Button>
          </DialogContent>
        </Dialog>

        <Separator/>

        <ToggleGroup
          type="single"
          variant='outline'
          value={theme}
          onValueChange={(value)=> setTheme(value)}
        >
          <ToggleGroupItem value="light" className="flex space-x-3">
            <Sun/>
            <p>Light</p>
          </ToggleGroupItem>

          <ToggleGroupItem value="dark" className="flex space-x-3">
            <SunMoon/>
            <p>Dark</p>
          </ToggleGroupItem>

          <ToggleGroupItem value="system" className="flex space-x-3">
            <LaptopMinimal/>
            <p>System Default</p>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
export default ProfileDialogContent