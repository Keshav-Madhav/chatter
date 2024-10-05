import {format} from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Image from 'next/image'
import Link from 'next/link'
import { timeStamp } from 'console'

type Props = {
  fromCurrentUser:boolean;
  senderImage:string;
  senderName: string;
  lastByUser: boolean;
  content: string[]
  createdAt: number;
  type: string;
  seen?: React.ReactNode;
}

const MessageItem = ({fromCurrentUser, senderImage, senderName, lastByUser, content, createdAt, type, seen}: Props) => {
  const formatTime = (timeStamp: number)=> format(timeStamp, 'HH:mm')
  return (
    <div className={cn('flex flex-col w-full mx-2', {
      'justify-end': fromCurrentUser,
    })}>
      <div className={cn('flex flex-col w-full mx-2', {
        'order-1 items-end': fromCurrentUser,
        'order-2 items-start': !fromCurrentUser,
      })}>
        <div className={cn('px-3 py-1 flex flex-col space-x-2 items-center justify-between rounded-lg max-w-[80%]', {
          'bg-blue-700 text-primary-foreground' : fromCurrentUser && type === 'text',
          'bg-secondary text-secondary': !fromCurrentUser && type === 'text',
          'rounded-br-none': fromCurrentUser && !lastByUser,
          'rounded-bl-none': !fromCurrentUser && !lastByUser,
        })}>

          {type === 'text' && (
            <p className='text-wrap break-words whitespace-pre-wrap break-all'>{content}</p>
          )}
          {type === 'audio' && (
            <audio controls className="max-w-44 md:max-w-full">
              <source src={content[0]} type="audio/mp3"/>
              Your browser does not support the audio element
            </audio>
          )}
          {type === 'image' && (
            <Link href={content[0]} target='_blank' passHref rel='noopener noreferrer'>
              <Image src={content[0]} width={240} height={112} alt="image" className="rounded-xl w-60 h-28 object-cover"/>
            </Link>
          )}
          {type === 'pdf' && (
            <Link href={content[0]} target='_blank' rel='noopener noreferrer'>
              <iframe src={content[0] + '#toolbar=0'} width="100%" height="100%"/>
            </Link>
          )}

          <p className={cn('text-xs flex w-full my-1', {
            'text-primary-foreground justify-end': fromCurrentUser,
            'text-secondary-foreground justify-start': !fromCurrentUser,
            'dark:text-white text-black': type === 'audio' || type === 'pdf' || type === 'image',
          })}>
            {formatTime(createdAt)}
          </p>
        </div>

        <span className='text-sm italic'>{seen}</span>
      </div>

      <Avatar className={cn('size-8 relative', {
        'order-2': fromCurrentUser,
        'order-1': !fromCurrentUser,
        'invisible': lastByUser,
      })}>
        <AvatarImage src={senderImage}/>
        <AvatarFallback>{senderName.slice(0, 2)}</AvatarFallback>
      </Avatar>
    </div>
  )
}
export default MessageItem