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
  const [userStatus, setUserStatus] = useState(status[0]);

  const {theme, setTheme} = useTheme();

  const addFriendFormSchema = z.object({
    email: z.string().email().min(1, {message: 'Email is required'}),
  })

  const form = useForm<z.infer<typeof addFriendFormSchema>>({
    resolver: zodResolver(addFriendFormSchema),
    defaultValues:{
      email: '',
    }
  })

  const onSubmit = async ({email}: z.infer<typeof addFriendFormSchema>) => {
    console.log(email)
  }

  return (
    <div>
      <Card className="border-0 flex flex-col space-y-4 bg-transparent">
        <CardTitle className="dark:text-white text-gray-950">Profile</CardTitle>

        <div>
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
        </div>
      </Card>

      <div className="flex flex-col gap-y-6 mt-4">
        <div className="flex items-center space-x-2">
          <UserRound/>
          <Input
            disabled
            placeholder="Name"
            value={'User Name'}
            className="border-none outline-none ring-0"
          />
        </div>

        <Separator/>

        <div className="flex items-center justify-center space-x-5">
          <p>Manage Your Account</p>
          <Button>
            User Button
          </Button>
        </div>

        <Separator/>

        <Dialog>
          <DialogTrigger>
            <div className="flex items-center space-x-2">
              <UserRoundSearch/>
              <p>Send friend request</p>
            </div>
          </DialogTrigger>

          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="email" render={({field})=>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={true} 
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
                  disabled={true}  
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
            </div>
          </DialogTrigger>

          <DialogContent>
            <p className="text-xl text-center font-bold">No friend requests.</p>
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
              <p>display current status</p>
            </div>
          </DialogTrigger>

          <DialogContent>
            <Textarea 
              placeholder="Display current status"
              className="resize-none h-48"
              value={userStatus}
              onChange={(e)=> setUserStatus(e.target.value)}
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
              onClick={()=> {
                setOpenStatus(false)
              }}
              disabled
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