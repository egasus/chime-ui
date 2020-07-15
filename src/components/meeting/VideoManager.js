import React, { useReducer, useEffect } from "react";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import VideoTile from "./VideoTitle";

const muiStyles = (theme) => ({
  tileGrid: {
    padding: 10,
  },
  screenview: {
    resize: "both",
  },
});

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
export const nameplateDiv = () =>
  document.getElementById("share-content-view-nameplate");
export const getWidthRate = (tileSize) => {
  switch (tileSize) {
    case tileSize < 2:
      return 12;
    case tileSize < 3:
      return 6;
    case tileSize < 5:
      return 4;
    default:
      return 4;
  }
};

const VideoManager = ({
  MeetingManager,
  isScreenShare,
  handleScreenShareStoping,
  isVideo,
  classes,
}) => {
  const [state, dispatch] = useReducer(reducer, {});

  const videoTileDidUpdate = (tileState) => {
    console.log(tileState.isContent);
    dispatch({ type: "TILE_UPDATED", payload: tileState });
  };

  const videoTileWasRemoved = (tileId) => {
    dispatch({ type: "TILE_DELETED", payload: tileId });
  };

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
      screenViewDiv().style.height = isScreenShare ? "100%" : "0%";
    }
  }, [isScreenShare]);

  // const lgWd = getWidthRate(Object.keys(state).length);

  // const videos = Object.keys(state).map((tileId, idx) => (
  //   <Grid item lg={lgWd} key={`video-tile-${idx}`}>
  //     <VideoTile
  //       key={tileId}
  //       nameplate="Attendee ID"
  //       isLocal={false}
  //       bindVideoTile={(videoRef) =>
  //         MeetingManager.bindVideoTile(parseInt(tileId), videoRef)
  //       }
  //     />
  //   </Grid>
  // ));

  const lgWd = getWidthRate(7);

  const videos = [1, 2, 3, 4, 5, 6, 7].map((tileId, idx) => (
    <Grid item lg={lgWd} key={`video-tile-${idx}`} className={classes.tileGrid}>
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

  return (
    <>
      <div id="shared-content-view" className={classes.screenview}>
        {isScreenShare && (
          <div id="share-content-view-nameplate">No one is sharing screen</div>
        )}
      </div>
      {!isScreenShare && (
        <Grid container justify="flex-start" alignItems="center">
          {videos}
        </Grid>
      )}
    </>
  );
};

export default withStyles(muiStyles)(VideoManager);
