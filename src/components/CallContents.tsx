"use client"

import Image from "next/image"
import { RefreshCw } from "lucide-react"
import { v4 as uuid } from "uuid"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type Props = {}
const CallContents = (props: Props) => {
  const router = useRouter()
  const [meetingCode, setMeetingCode] = useState("")
  
  const joinMeeting = () => {
    router.push(`/calls/${meetingCode}`)
  }

  const generateLink = () => {
    const code = uuid()

    navigator.clipboard.writeText(code)
    toast.success("Call code copied to clipboard")
  }

  return (
    <div className="grid p-3 md:p-10 md:grid-cols-2 gap-10 w-full place-content-center">
      <div className="flex items-center">
        <div className="md:w-96 mx-auto flex flex-col gap-y-10">
          <div className="flex flex-col gap-y-7">
            <h1 className="text-4xl font-bold">Start a group call</h1>
            <div className="flex gap-2 flex-col md:flex-row">
              <p className="tmt-2 text-gray-500">Share this call code with your friends.</p>

              <Button onClick={generateLink}>
                Generate code
                <RefreshCw className="ml2"/>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-y-5">
            <Input className="h-14 " type="text" placeholder="Call Link" onChange={(e) => setMeetingCode(e.target.value)} value={meetingCode}/>
            <Button onClick={joinMeeting} className="w-full h14" disabled={!meetingCode || meetingCode.length < 2}>
              Join call
            </Button>
          </div>
        </div>
      </div>
      <div className="size-72 lg:size-96 md:size-[300px] mx-auto rounded-full overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={500} height={500} alt="call" className="object-cover w-full h-full hover:scale-110 transition-transform"/>
      </div>
    </div>
  )
}
export default CallContents