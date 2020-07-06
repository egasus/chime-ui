import React, { useEffect, useRef } from "react";

// import MeetingManager from "services/MeetingManager";

const MeetingAudio = ({ MeetingManager }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    MeetingManager.bindAudioElement(audioRef.current);

    return () => MeetingManager.unbindAudioElement();
  }, [audioRef]);

  return <audio ref={audioRef} style={{ display: "none" }}></audio>;
};

export default MeetingAudio;
