"use client"

import SharedLayout from "@/components/SharedLayout";
import ChatsSidebar from "@/components/ChatsSidebar";

type Props = {
  children: React.ReactNode;
}

const ChatsLayout = ({ children }: Props) => {
  return (
    <SharedLayout
      sideBarComponnent={()=> <ChatsSidebar/>}

    >
      {children}
    </SharedLayout>
  )
}
export default ChatsLayout