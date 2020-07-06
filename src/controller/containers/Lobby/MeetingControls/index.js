import "./MeetingControls.css";

import React from "react";

import Button from "components/Button";
import {
  useControllerDispatch,
  useControllerState,
} from "../../ControllerProvider";
import { Type as actionType } from "components/meeting/RoomProvider/reducer";
// import { IoTClient } from '../../../../IoTClient';

const MeetingControls = () => {
  // const iotClient = IoTClient.getInstance();
  const state = useControllerState();
  const dispatch = useControllerDispatch();

  const toggleVideoTile = () => {
    console.log("toggle-screen-video");
    dispatch({
      type: state.isSharingLocalVideo
        ? actionType.StopLocalVideo
        : actionType.StartLocalVideo,
    });
    // iotClient.publish('iot/meeting/video/', "Device toggle video");
  };

  const toggleScreenShareViewTile = () => {
    dispatch({
      type: state.isViewingSharedScreen
        ? actionType.StopScreenShareView
        : actionType.StartScreenShareView,
    });
    // iotClient.publish('iot/meeting/screenShare/', "Device toggle screen share");
  };

  const leaveMeeting = () => {
    dispatch({
      type: actionType.LeaveMeeting,
    });
    // iotClient.publish('iot/meeting/leave/', "Device leaves meeting");
  };

  const endMeeting = () => {
    dispatch({
      type: actionType.EndMeeting,
    });
    // iotClient.publish('iot/meeting/end/', "Device ends meeting");
  };

  return (
    <div className="MeetingControls">
      <Button active={state.isSharingLocalVideo} onClick={toggleVideoTile}>
        {state.isSharingLocalVideo ? "Disable video" : "Enable video"}
      </Button>
      <Button
        active={state.isViewingSharedScreen}
        onClick={toggleScreenShareViewTile}
      >
        {state.isViewingSharedScreen ? "Hide ScreenShare" : "View ScreenShare"}
      </Button>
      <Button onClick={leaveMeeting}>Leave meeting</Button>
      <Button onClick={endMeeting}>End meeting</Button>
    </div>
  );
};

export default MeetingControls;
