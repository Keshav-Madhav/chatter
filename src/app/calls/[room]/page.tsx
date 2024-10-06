import NavigationBar from "@/components/NavigationBar"
import MeetingRoom from "@/components/MeetingRoom"

type Props = {
  params: {
    room: string
  }
}

const page = ({ params: { room } }: Props) => {
  return (
    <>
      <NavigationBar trigger={null} />

      <MeetingRoom chat_id={room}/>
    </>
  )
}
export default page