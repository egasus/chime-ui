import React from "react";

// import { useControllerState } from "../ControllerProvider";
import MeetingControls from "./MeetingControls";
// import MeetingForm from "./MeetingForm";

import "./Lobby.css";

const Lobby = () => {
  // const { activeMeeting } = useControllerState();

  return (
    <div className="Lobby">
      <MeetingControls />
    </div>
  );
};

export default Lobby;
