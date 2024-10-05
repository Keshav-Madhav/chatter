import NavigationBar from "@/components/NavigationBar"
import NewGroup from "@/components/NewGroup"
import { Id } from "../../../../convex/_generated/dataModel"
import ChatContent from "@/components/ChatContent"

type Props = {
  params: {
    chat_id: Id<"conversations">
  }
}

const page = ({ params: { chat_id } }: Props) => {
  return (
    <>
      <div className="hidden md:block">
        <NavigationBar trigger={<NewGroup/>} />
      </div>

      <ChatContent chat_id={chat_id} />
    </>
  )
}
export default page