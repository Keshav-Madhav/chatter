import { FC } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

type Props = {
  children: React.ReactNode
  title: string
  trigger: React.ReactNode
}

const SideBarContainer: FC<Props> = ({children, title, trigger}) => {
  return (
    <ScrollArea className="h-full">
      <div className="px-4">
        <div className="flex items-center mt-10 justify-between">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <div>{trigger}</div>
        </div>
        
        <div className="my-8 h-10 bg-gray-200 dark:bg-gray-800 flex items-center p-2 rounded-xl">
          <Search className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-10 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 focus:outline-none active:outline-none"
          />
        </div>

        {children}
      </div>
    </ScrollArea>
  )
}
export default SideBarContainer