import React, { useReducer, useEffect } from "react";

import VideoGrid from "./VideoGrid";
import VideoTile from "./VideoTitle";
import { Type as actionType } from "./RoomProvider/reducer";
import {
  useRoomProviderDispatch,
  useRoomProviderState,
} from "./RoomProvider/index";

function reducer(state, { type, payload }) {
  switch (type) {
    case "TILE_UPDATED": {
      const { tileId, ...rest } = payload;
      return {
        ...state,
        [tileId]: {
          ...rest,
        },
      };
    }
    case "TILE_DELETED": {
      const { [payload]: omit, ...rest } = state;
      return {
        ...rest,
      };
    }
    default: {
      return state;
    }
  }
}
// TODO: Make as component.
export const screenViewDiv = () =>
  document.getElementById("shared-content-view");

const VideoManager = ({ MeetingManager }) => {
  const roomProviderDispatch = useRoomProviderDispatch();
  const context = useRoomProviderState();
  console.log("context", context);
  const isViewingSharedScreen = true;
  const [state, dispatch] = useReducer(reducer, {});
  console.log("state--------------------->", state);

  const videoTileDidUpdate = (tileState) => {
    console.log("tileState------------------>", tileState);
    console.log(tileState.isContent);
    dispatch({ type: "TILE_UPDATED", payload: tileState });
  };

  const videoTileWasRemoved = (tileId) => {
    dispatch({ type: "TILE_DELETED", payload: tileId });
  };

  const nameplateDiv = () =>
    document.getElementById("share-content-view-nameplate");

  const streamDidStart = (screenMessageDetail) => {
    console.log("tile updated------------------>");
    // MeetingManager.getAttendee(screenMessageDetail.attendeeId).then((name) => {
    //   nameplateDiv().innerHTML = name;
    // });
    nameplateDiv().innerHTML = screenMessageDetail.attendeeId;
    const deviceMessage = {
      type: actionType.StartScreenShareView,
    };

    roomProviderDispatch(deviceMessage);
  };

  const streamDidStop = (screenMesssageDetail) => {
    nameplateDiv().innerHTML = "No one is sharing screen";
    const deviceMessage = {
      type: actionType.StopScreenShareView,
    };

    roomProviderDispatch(deviceMessage);
  };

  const videoObservers = { videoTileDidUpdate, videoTileWasRemoved };
  const screenShareObservers = { streamDidStart, streamDidStop };

  useEffect(() => {
    MeetingManager.addAudioVideoObserver(videoObservers);
    MeetingManager.registerScreenShareObservers(screenShareObservers);
    MeetingManager.startLocalVideo();

    return () => {
      MeetingManager.removeMediaObserver(videoObservers);
      MeetingManager.removeScreenShareObserver(screenShareObservers);
    };
  }, []);

  console.log("isViewingSharedScreen----->", isViewingSharedScreen);
  useEffect(() => {
    screenViewDiv().style.display = isViewingSharedScreen ? "grid" : "none";
  }, [isViewingSharedScreen]);

  const videos = Object.keys(state).map((tileId) => (
    <VideoTile
      key={tileId}
      nameplate="Attendee ID"
      isLocal={state[tileId].localTile}
      bindVideoTile={(videoRef) =>
        MeetingManager.bindVideoTile(parseInt(tileId), videoRef)
      }
    />
  ));
  console.log("videos", videos);
  console.log("state", state);

  return <VideoGrid size={videos.length}>{videos}</VideoGrid>;
};

export default VideoManager;
