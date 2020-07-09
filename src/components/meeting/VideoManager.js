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

const VideoManager = ({ MeetingManager, isScreenShare }) => {
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
    nameplateDiv().innerHTML = screenMessageDetail.attendeeId;
  };

  const streamDidStop = (screenMesssageDetail) => {
    nameplateDiv().innerHTML = "No one is sharing screen";
  };

  const videoObservers = { videoTileDidUpdate, videoTileWasRemoved };
  const screenShareObservers = { streamDidStart, streamDidStop };

  useEffect(() => {
    MeetingManager.addAudioVideoObserver(videoObservers);
    MeetingManager.registerScreenShareObservers(screenShareObservers); // share screen
    MeetingManager.startLocalVideo();

    return () => {
      MeetingManager.removeMediaObserver(videoObservers);
      MeetingManager.removeScreenShareObserver(screenShareObservers);
    };
  }, []);

  useEffect(() => {
    if (screenViewDiv()) {
      screenViewDiv().style.display = isScreenShare ? "grid" : "none";
    }
  }, [isScreenShare]);

  const videos = Object.keys(state).map((tileId, idx) =>
    state[tileId].localTile ? (
      <VideoTile
        key={tileId}
        nameplate="Attendee ID"
        isLocal={true}
        bindVideoTile={(videoRef) =>
          MeetingManager.bindVideoTile(parseInt(tileId), videoRef)
        }
      />
    ) : (
      <Grid item xs={3} key={`video-tile-${idx}`}>
        <VideoTile
          key={tileId}
          nameplate="Attendee ID"
          isLocal={false}
          bindVideoTile={(videoRef) =>
            MeetingManager.bindVideoTile(parseInt(tileId), videoRef)
          }
        />
      </Grid>
    )
  );

  return <VideoGrid size={videos.length}>{videos}</VideoGrid>;
};

export default VideoManager;
