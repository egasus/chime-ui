import React, { useReducer, useEffect } from "react";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import VideoTile from "./VideoTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MicOnIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";

import { getAttendee as getAttendeeApi } from "apis/chimeMeeting";

const muiStyles = (theme) => ({
  tileGrid: {
    padding: 10,
    position: "relative",
  },
  screenview: {
    resize: "both",
  },
  videoTileBottom: {
    position: "absolute",
    bottom: 30,
  },
  tileMuteIcon: {
    marginRight: 30,
    backgroundColor: "rgb(224, 35, 125)",
  },
  nameTypo: {
    marginLeft: 30,
  },
});

// TODO: Make as component.
export const screenViewDiv = () =>
  document.getElementById("shared-content-view");
export const nameplateDiv = () =>
  document.getElementById("share-content-view-nameplate");
export const getWidthRate = (tileSize) => {
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
  // setIsShare,
  handleScreenShareStoping,
  classes,
  allTiles,
  addTile,
  removeTile,
}) => {
  const videoTileDidUpdate = async (tileState) => {
    if (
      !tileState.boundAttendeeId ||
      (tileState.boundVideoElement && !tileState.boundVideoStream)
    ) {
      return;
    }
    const attendeeInfo = await getAttendeeApi(
      MeetingManager.title,
      tileState.boundAttendeeId
    );

    const details = {
      tileId: tileState.tileId,
      attendeeId: tileState.boundAttendeeId,
      attendeeName: attendeeInfo.Attendee.Name,
    };
    console.log("videoTileDidUpdate", tileState);
    console.log("videoTileDidUpdatedetails", details);
    addTile(details);
  };

  const videoTileWasRemoved = async (tileId) => {
    console.log("tile -removed");
    removeTile(tileId);
  };

  const streamDidStart = (screenMessageDetail) => {
    // setIsShare(true);

    // setTimeout(() => {
    //   MeetingManager.getAttendee(screenMessageDetail.attendeeId).then(
    //     (name) => {
    //       // nameplateDiv().innerHTML = name;
    //     }
    //   );
    console.log("error----did-start");
    MeetingManager.startViewingScreenShare(screenViewDiv());
    // }, 1000);
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

  console.log("allTiles", allTiles);
  const lgWd = getWidthRate(allTiles.length);
  const videos = allTiles.map((tile, idx) => (
    <Grid item lg={lgWd} key={`video-tile-${idx}`} className={classes.tileGrid}>
      <VideoTile
        key={tile.tileId}
        nameplate="Attendee ID"
        isLocal={false}
        bindVideoTile={(videoRef) =>
          MeetingManager.bindVideoTile(tile.tileId, videoRef)
        }
      />
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.videoTileBottom}
      >
        <Typography className={classes.nameTypo}>{`${tile.attendeeName}${
          tile.attendeeId === MeetingManager.joinInfo.Attendee.AttendeeId
            ? " (YOU)"
            : ""
        }`}</Typography>
        <IconButton className={classes.tileMuteIcon}>
          {!tile.isMuted ? <MicOnIcon /> : <MicOffIcon />}
        </IconButton>
      </Grid>
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
