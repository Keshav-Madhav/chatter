import CallContents from "@/components/CallContents"
import NavigationBar from "@/components/NavigationBar"

type Props = {}

const page = (props: Props) => {
  return (
    <div>
      <NavigationBar trigger={null} />

      <CallContents />
    </div>
  )
}
export default page