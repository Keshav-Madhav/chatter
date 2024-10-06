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
import { Paperclip, Send, Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import data from "@emoji-mart/data"
import TextareaAutoSize from "react-textarea-autosize";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { FilePond, registerPlugin} from "react-filepond";
import 'filepond/dist/filepond.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePongPluginFileValidateType from 'filepond-plugin-file-validate-type'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import {v4 as uuid} from 'uuid'
import { supabaseBrowserClient as supabase } from "@/supabase/supabaseClient";
import { AudioRecorder } from 'react-audio-voice-recorder';
import Pusher from 'pusher-js'
import axios from 'axios'

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
  const [isTyping, setIsTyping] = useState(false)
  const [typing, setTyping] = useState(false)
  const [imageOrPdf, setImageOrPdf] = useState<Blob | null>(null)
  const [imageOrPdfModal, setImageOrPdfModal] = useState(false)
  const [isSendingFile, setIsSendingFile] = useState(false)

  registerPlugin(FilePondPluginImagePreview, FilePongPluginFileValidateType);

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

    if (!typing){
      setTyping(true)
      await axios.post('/api/type-indicator', {
        channel: chat_id,
        event: 'typing',
        data: { isTyping: true, userId: currUserId }
      })

      setTimeout(async () => {
        setTyping(false)
        await axios.post('/api/type-indicator', {
          channel: chat_id,
          event: 'typing',
          data: { isTyping: false, userId: currUserId }
        })
      }, 2000)
    }
  }

  const handleImageUpload = async () => {
    if(!imageOrPdf) return
    setIsSendingFile(true)
    const uniqueId = uuid()

    try {
      let fileName;
      if(imageOrPdf.type.startsWith('image/')) {
        fileName = `chat/image-${uniqueId}.jpg`
      } else if (imageOrPdf.type.startsWith('application/pdf')) {
        fileName = `chat/pdf-${uniqueId}.pdf`
      } else{
        console.error('Invalid file type')
        toast.error('Invalid file type')
        return;
      }

      const file = new File([imageOrPdf], fileName, {type: imageOrPdf.type})

      const {data, error} = await supabase.storage.from('chat-files').
        upload(fileName, file,  {
          cacheControl: '3600',
          upsert: false
        })
      if(error){
        console.error(error)
        toast.error("Failed to send file")
        return;
      }
      const {data:{ publicUrl }} = await supabase.storage.from('chat-files').getPublicUrl(data.path)

      await createMessage({
        conversationId: chat_id,
        type: imageOrPdf.type.startsWith('image/') ? 'image' : 'pdf',
        content: [publicUrl]
      })

      toast.success("File sent")
    } catch (error) {
      toast.error("Failed to send file")
    } finally {
      setIsSendingFile(false)
      setImageOrPdf(null)
      setImageOrPdfModal(false)
    }
  }

  const addAudioElement = async (audio: Blob) => {
    try {
      const uniqueId = uuid()
      const file = new File([audio], 'audio.webm', {type: audio.type})
      const fileName = `chat/audio-${uniqueId}.webm`

      const {data, error} = await supabase.storage.from('chat-files').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
      if(error){
        console.error(error)
        toast.error("Failed to send audio")
        return;
      }
      const {data:{ publicUrl }} = await supabase.storage.from('chat-files').getPublicUrl(data.path)

      await createMessage({
        conversationId: chat_id,
        type: 'audio',
        content: [publicUrl]
      })

      toast.success("Audio sent")
    } catch (error) {
      console.error(error)
      toast.error("Failed to send audio")
    }
  }

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(chat_id)
    channel.bind('typing', (data: {isTyping: boolean, userId: string}) => {
      if(data.userId !== currUserId){
        setIsTyping(data.isTyping)
      }
    })

    return () => {
      pusher.unsubscribe(chat_id)
    }
  }, [])

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
            <FormControl className="relative">
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

                {isTyping && (
                  <p className="absolute -top-6 text-xs ml-1 text-gray-500 dark:text-gray-400">Typing...</p>
                )}
              </>
            </FormControl>
          )}
        />

        <Dialog open={imageOrPdfModal} onOpenChange={setImageOrPdfModal}>
          <DialogTrigger>
            <Paperclip className="cursor-pointer" size={30} />
          </DialogTrigger>

          <DialogContent className="min-w-80">
            <DialogHeader>
              <DialogTitle>Send a file</DialogTitle>
              <DialogDescription>
                Upload Pdf or Image
              </DialogDescription>
            </DialogHeader>

            <FilePond
              className='cursor-pointer'
              files={imageOrPdf ? [imageOrPdf]: []}
              allowMultiple={false}
              acceptedFileTypes={['image/*', 'application/pdf']}
              labelIdle="Drag & Drop your files or <span class='filepond--label-action'>Browse</span>"
              onupdatefiles={(fileItems) => {
                setImageOrPdf(fileItems[0]?.file)
              }}
            />

            <DialogFooter>
              <Button 
                type="button"
                disabled={isSendingFile || !imageOrPdf}
                onClick={handleImageUpload}
              >
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isDesktop && (
          <AudioRecorder
            onRecordingComplete={addAudioElement}
            audioTrackConstraints={{
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }}
            downloadFileExtension="webm"
          />
        )}
        
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