"use client"

import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";

type Props = {
  children: React.ReactNode;
  sideBarComponnent: FC<any>;
  sideBarProps?: any;
}

const SharedLayout = ({ children, sideBarComponnent: SideBar, sideBarProps }: Props) => {
  const [isRendered, setIsRendered] = useState(false);
  const { width, setWidth } = useSidebarWidth();
  const pathname = usePathname();

  useEffect(() => {
    setIsRendered(true);
  },[])

  if(!isRendered) return null;

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
      >
        <ResizablePanel
          defaultSize={width}
          minSize={20}
          maxSize={40}
          onResize={setWidth}
        >
          <SideBar {...sideBarProps}/>
        </ResizablePanel>
        <ResizableHandle 
          className="border-r border-r-gray-400 dark:border-r-gray-800" 
          withHandle
        />
        <ResizablePanel className="!overflow-y-auto my-20">
          <div className="h-full hidden md:block">
            {children}  
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="md:hidden">
        {children}  
      </div>
    </>
  )
}
export default SharedLayout