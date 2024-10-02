import SideBarContainer from "@/components/SideBarContainer"
import ChatList from "./ChatList"
import NewGroup from "./NewGroup"

type Props = {}

const ChatsSidebar = (props: Props) => {
  return (
    <SideBarContainer
      title="Chats"
      trigger={<NewGroup/>}
    >
      <ChatList />
    </SideBarContainer>
  )
}
export default ChatsSidebar