"use client";

import { useUser } from "@clerk/clerk-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

type Props = {
  chat_id: string;
}

const MeetingRoom = ({ chat_id }: Props) => {
  const [token, setToken] = useState("");
  const { user } = useUser();
  const email = user?.emailAddresses[0].emailAddress!;

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chat_id}&username=${email}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [chat_id, email]);

  if (token === "") {
    return <div>Loading...</div>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      connect={true}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
export default MeetingRoom