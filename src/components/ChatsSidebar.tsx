import SideBarContainer from "@/components/SideBarContainer"
import ChatList from "./ChatList"

type Props = {}

const ChatsSidebar = (props: Props) => {
  return (
    <SideBarContainer
      title="Chats"
      trigger={<></>}
    >
      <ChatList />
    </SideBarContainer>
  )
}
export default ChatsSidebar