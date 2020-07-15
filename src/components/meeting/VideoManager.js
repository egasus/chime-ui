import React, { useReducer, useEffect } from "react";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import VideoTile from "./VideoTitle";
import { Typography } from "@material-ui/core";

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
  console.log('tileSize', tileSize);
    if (tileSize < 2) {
      return 12;
    } else if (tileSize < 5) {
      return 6;
    } else if (tileSize < 10) {
      return 4;
    }
    return 3;
};

const VideoManager = ({
  MeetingManager,
  isScreenShare,
  setIsShare,
  handleScreenShareStoping,
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
    setIsShare(true);
    setTimeout(() => {
      MeetingManager.startViewingScreenShare(screenViewDiv());
    }, 1000);
  };

  const streamDidStop = (screenMesssageDetail) => {
    // nameplateDiv().innerHTML = "No one is sharing screen";
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
    if (screenViewDiv()) {
      screenViewDiv().style.height = isScreenShare ? "100%" : "0%";
    }
  }, [isScreenShare]);

  const lgWd = getWidthRate(Object.keys(state).length);
  console.log('lgWd--->', lgWd);
  const videos = Object.keys(state).map((tileId, idx) => (
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

  const isNoVideo = videos.length < 1;

  return (
    <>
      <div id="shared-content-view" className={classes.screenview}>
        {isScreenShare && (
          <div id="share-content-view-nameplate">No one is sharing screen</div>
        )}
      </div>
      {!isScreenShare && (
        <Grid
          container
          justify={!isNoVideo ? "flex-start" : "center"}
          alignItems="center"
        >
          {!isNoVideo ? (
            videos
          ) : (
            <Typography align="center">
              None of the participants have enabled their video camera
            </Typography>
          )}
        </Grid>
      )}
    </>
  );
};

export default withStyles(muiStyles)(VideoManager);
