import { z } from "zod";
import { Id } from "../../convex/_generated/dataModel"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import useMutationHandler from "@/hooks/useMutationHandler";
import { api } from "../../convex/_generated/api";
import { Form, FormControl, FormField } from "./ui/form";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Send, Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import data from "@emoji-mart/data"
import TextareaAutoSize from "react-textarea-autosize";

type Props = {
  chat_id: Id<"conversations">
  currUserId: string;
}

const chatMessageSchema = z.object({
  message: z.string().min(1, {message: 'Message is required'})
})

const ChatFooter = ({ chat_id, currUserId }: Props) => {
  const {mutate: createMessage, state: messageState} = useMutationHandler(api.message.create)
  const isDesktop = useIsDesktop();
  const { width } = useSidebarWidth();
  const { resolvedTheme } = useTheme();

  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues:{
      message: '',
    }
  })

  const handleSubmit = async (data: z.infer<typeof chatMessageSchema>) => {
    if (data.message.length < 1) return
    try {
      await createMessage({
        conversationId: chat_id,
        type: "text",
        content: [data.message]
      })
      form.reset();
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.message : "An error occurred")
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target
    
    if(selectionStart !== null) {
      form.setValue('message', value)
    }
  }

  return (
    <Form {...form}>
      <form 
        className="fixed px-3 md:pr-10 flex items-center justify-between space-x-3 x-30 bottom-0 w-full bg-white dark:bg-gray-800 h-20"
        style={isDesktop ? { width: `calc(100% - ${width + 3}%)` } : {}}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Popover>
          <PopoverTrigger>
            <Button type="button">
              <Smile size={20} />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-fit p-0">
            <Picker theme={resolvedTheme} data={data} onEmojiSelect={(emoji:any)=>{
              form.setValue('message', form.getValues('message') + emoji.native)
            }}/>
          </PopoverContent>
        </Popover>

        <FormField
          control={form.control}
          name="message"
          render={({field})=>(
            <FormControl>
              <>
                <TextareaAutoSize 
                  onKeyDown={async e =>{
                    if(e.key === 'Enter' && !e.shiftKey){
                      e.preventDefault()
                      await form.handleSubmit(handleSubmit)()
                    }
                  }}
                  rows={1}
                  maxRows={2}
                  {...field}
                  disabled={messageState === 'loading'}
                  placeholder="Type a message"
                  onChange={handleInputChange}
                  className="flex-grow bg-gray-200 dark:bg-gray-600 rounded-2xl resize-none px-4 py-2 ring-0 focus:ring-0 focus:outline-none outline-none"
                />
              </>
            </FormControl>
          )}
        />

        <Button
          className="cursor-pointer rounded-lg border pt-1.5 pr-1.5 p-1" 
          disabled={messageState === 'loading' || form.getValues('message').length === 0}
          onClick={async ()=> form.handleSubmit(handleSubmit)()}
        >
          <Send size={30} />
        </Button>
      </form>
    </Form>
  )
}
export default ChatFooter