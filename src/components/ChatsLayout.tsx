"use client"

import SharedLayout from "@/components/SharedLayout";

type Props = {
  children: React.ReactNode;
}

const ChatsLayout = ({ children }: Props) => {
  return (
    <SharedLayout
      sideBarComponnent={()=> <></>}
      
    >
      {children}
    </SharedLayout>
  )
}
export default ChatsLayout