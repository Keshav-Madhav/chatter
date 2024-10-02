'use client'

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import useMutationHandler from "@/hooks/useMutationHandler";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Users, X } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const createGroupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(20, "Name must be at most 20 characters long"),
  members: z.array(z.string()).min(2, "Group must have at least 2 members")
})

type Props = {}

const NewGroup = (props: Props) => {
  const contacts = useQuery(api.contacts.get);
  const {mutate: createGroup, state: createGroupState} = useMutationHandler(api.contacts.creategroup);
  const [openModal, setOpenModal] = useState(false)

  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues:{
      name: "",
      members: []
    }
  })

  const members = form.watch("members", [])
  const unselectedContacts = useMemo(()=> {
    return contacts ? contacts.filter(contact => !members.includes(contact._id)) : []
  }, [contacts, members])

  const createGroupfunc = async ({members, name}: z.infer<typeof createGroupSchema>) => {
    try {
      await createGroup({members, name})

      toast.success(`Group ${name} created successfully`,{
        description: `Group with ${members.length} members created successfully`
      })

      setOpenModal(false)
      form.reset();
    } catch (error) {
      console.log(error)
      toast.error(error instanceof ConvexError ? error.data : "An error occurred")
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger>
        <Users size={20} className="cursor-pointer"/>
      </DialogTrigger>

      <DialogContent>
        <Form {...form}>
          <form className="space-y-8 " onSubmit={form.handleSubmit(createGroupfunc)}>
            <fieldset>
              <FormField control={form.control} name="name" render={({field}) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="New Group"/>
                  </FormControl>

                  <FormDescription>
                    This is the name of the group
                  </FormDescription>

                  <FormMessage {...field}/>
                </FormItem>
              )}/>

              <FormField control={form.control} name="members" render={_ => 
                <FormItem>
                  <FormLabel>Members</FormLabel>
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={unselectedContacts.length === 0}>
                        <Button className="ml-4" variant="outline">
                          Select Contacts
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Contacts</DropdownMenuLabel>
                        <DropdownMenuSeparator/>

                        {unselectedContacts.map(contact => (
                          <DropdownMenuCheckboxItem
                            key={contact._id}
                            className="flex items-center gap-2 w-full p-2"
                            checked={members.includes(contact._id)}
                            onCheckedChange={(e) => {
                              if(e){
                                form.setValue("members", [...members, contact._id])
                              }
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={contact.imageUrl} alt={contact.username}/>
                              <AvatarFallback>{contact.username.slice(0,2)}</AvatarFallback>
                            </Avatar>

                            <h4 className="truncate">{contact.username}</h4>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>

                  <FormDescription>
                    Add members to the group
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              }/>
            </fieldset>

            {members.length > 0 && 
              <Card className="flex items-center flex-wrap gap-3 overflow-x-auto w-full h-24 p-2">
                {contacts?.filter(contact => members.includes(contact._id)).map(contact => (
                  <div 
                    key={contact._id}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="relative flex items-center gap-2 border rounded-full p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.imageUrl} alt={contact.username}/>
                        <AvatarFallback>{contact.username.slice(0,2)}</AvatarFallback>
                      </Avatar>

                      <p className="truncate text-sm">{contact.username}</p>

                      <X 
                        onClick={()=>{
                          form.setValue("members", members.filter(member => member !== contact._id))
                        }} 
                        className="text-muted-foreground h-4 w-4 absolute bottom-8 left-7 bg-muted rounded-full cursor-pointer"
                      />
                    </div>

                  </div>
                ))}
              </Card>
            }

            <DialogFooter>
              <Button
                type="submit"
                disabled={createGroupState === "loading"}
              >
                Create Group
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
export default NewGroup