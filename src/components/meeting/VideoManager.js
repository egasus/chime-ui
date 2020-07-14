import React, { useReducer, useEffect } from "react";

import Grid from "@material-ui/core/Grid";

import VideoGrid from "./VideoGrid";
import VideoTile from "./VideoTitle";

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

export const getWidthRate = (tileSize) => {
  switch (tileSize) {
    case tileSize < 2:
      return 12;
    case tileSize < 3:
      return 6;
    case tileSize < 5:
      return 4;
    default:
      return 3;
  }
};

const VideoManager = ({
  MeetingManager,
  isScreenShare,
  handleScreenShareStoping,
  isVideo,
}) => {
  const [state, dispatch] = useReducer(reducer, {});

  const videoTileDidUpdate = (tileState) => {
    console.log(tileState.isContent);
    dispatch({ type: "TILE_UPDATED", payload: tileState });
  };

  const videoTileWasRemoved = (tileId) => {
    dispatch({ type: "TILE_DELETED", payload: tileId });
  };

  const nameplateDiv = () =>
    document.getElementById("share-content-view-nameplate");

  const streamDidStart = (screenMessageDetail) => {
    console.log("screenMessageDetail", screenMessageDetail);
    MeetingManager.getAttendee(screenMessageDetail.attendeeId).then((name) => {
      nameplateDiv().innerHTML = name;
    });
    MeetingManager.startViewingScreenShare(screenViewDiv());
  };

  const streamDidStop = (screenMesssageDetail) => {
    nameplateDiv().innerHTML = "No one is sharing screen";
    MeetingManager.stopViewingScreenShare();
    handleScreenShareStoping();
  };

  const videoObservers = { videoTileDidUpdate, videoTileWasRemoved };
  const screenShareObservers = { streamDidStart, streamDidStop };

  useEffect(() => {
    MeetingManager.addAudioVideoObserver(videoObservers);
    MeetingManager.registerScreenShareObservers(screenShareObservers); // share screen

    return () => {
      MeetingManager.removeMediaObserver(videoObservers);
      MeetingManager.removeScreenShareObserver(screenShareObservers);
    };
  }, []);
  useEffect(() => {
    if (isVideo) {
      MeetingManager.startLocalVideo();
    }
  }, [isVideo]);

  useEffect(() => {
    if (screenViewDiv()) {
      screenViewDiv().style.display = isScreenShare ? "grid" : "none";
    }
  }, [isScreenShare]);

  const lgWd = getWidthRate(Object.keys(state).length);

  const videos = Object.keys(state).map((tileId, idx) => (
    <Grid item lg={lgWd} key={`video-tile-${idx}`}>
      <VideoTile
        key={tileId}
        nameplate="Attendee ID"
        isLocal={false}
        bindVideoTile={(videoRef) =>
          MeetingManager.bindVideoTile(parseInt(tileId), videoRef)
        }
      />
    </Grid>
  ));

  return <VideoGrid size={videos.length}>{videos}</VideoGrid>;
};

export default VideoManager;
