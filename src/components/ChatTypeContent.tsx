import { AspectRatio } from "./ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"

type Props = {
  type: string;
  content: string[];
}

const ChatTypeContent = ({ type, content }: Props) => {

  return (
    <AspectRatio ratio={1/1}>
      {type === 'image' && (
        <Image src={content[0]} width={450} height={235} alt="file" className="rounded-md object-cover"/>
      )}
      {type === 'audio' && (
        <audio src={content[0]} controls className="w-full h-full"/>
      )}
      {type === 'pdf' && (
        <Link href={content[0]} target="_blank" rel="noopener noreferrer" className="bg-purple-500 underline">View PDF</Link>
      )}
    </AspectRatio>
  )
}
export default ChatTypeContent