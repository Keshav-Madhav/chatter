import MobileChatContents from "@/components/MobileChatContents"
import NavigationBar from "@/components/NavigationBar"
import NewGroup from "@/components/NewGroup"
import { FaSignalMessenger } from "react-icons/fa6"

type Props = {}

const page = (props: Props) => {
  return (
    <>
      <NavigationBar trigger={
        <NewGroup/>
      }/>

      <div className="hidden md:grid h-full max-w-56 text-center mx-auto place-content-center ">
        <FaSignalMessenger className="mx-auto text-primary-main" size={200}/>
        <p className="text-sm mt-5 text-primary-main">Welcome to Chatter! Continue your conversations or start a new one!</p>
      </div>

      <div className="md:hidden flex flex-col space-y-2">
        <MobileChatContents />
      </div>
    </>
  )
}
export default page