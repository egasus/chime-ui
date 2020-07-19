import React, { useState, useEffect, useCallback } from "react";

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
  videoTileWrapper: {
    height: "100%",
  },
});

// TODO: Make as component.
export const screenViewDiv = () =>
  document.getElementById("shared-content-view");
export const nameplateDiv = () =>
  document.getElementById("share-content-view-nameplate");
export const getWidthRate = (tileSize, wrapperHeight) => {
  let wdRate = 3;
  let height = wrapperHeight;
  if (tileSize < 2) {
    wdRate = 12;
  } else if (tileSize < 5) {
    wdRate = 6;
    height = parseInt(wrapperHeight / 2);
  } else if (tileSize < 10) {
    wdRate = 4;
    height = parseInt(wrapperHeight / 3);
  } else if (tileSize < 17) {
    height = parseInt(wrapperHeight / 4);
  }
  return [wdRate, height];
};

const VideoManager = ({
  MeetingManager,
  isScreenShare,
  setIsShare,
  handleScreenShareStoping,
  classes,
  allTiles,
  addTile,
  removeTile,
}) => {
  const [wrapperHeight, setWrapperHeight] = useState(100);
  const [sharingName, setSharingName] = useState(null);
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
    if (isScreenShare) {
      MeetingManager.startViewingScreenShare(screenViewDiv());
    } else {
      // remote stream
      setIsShare(true, () =>
        MeetingManager.startViewingScreenShare(screenViewDiv())
      );
    }
    if (
      screenMessageDetail.attendeeId ===
      MeetingManager.joinInfo.Attendee.AttendeeId
    ) {
      setSharingName("YOU");
    } else {
      const sharingUserName = MeetingManager.getMsgSenderName(
        screenMessageDetail.attendeeId
      );
      setSharingName(sharingUserName);
    }

    // setTimeout(() => {
    //   MeetingManager.getAttendee(screenMessageDetail.attendeeId).then(
    //     (name) => {
    //       // nameplateDiv().innerHTML = name;
    //     }
    //   );

    // }, 1000);
  };

  const streamDidStop = (screenMesssageDetail) => {
    // nameplateDiv().innerHTML = "No one is sharing screen";
    MeetingManager.stopViewingScreenShare();
    handleScreenShareStoping();
    setSharingName(null);
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

  const calcWrapperHeight = useCallback(() => {
    if (!isScreenShare && document.getElementById("video-tile-wrapper")) {
      setWrapperHeight(
        document.getElementById("video-tile-wrapper").clientHeight
      );
    }
  }, [isScreenShare]);

  useEffect(() => {
    if (screenViewDiv()) {
      screenViewDiv().style.height = isScreenShare ? "100%" : "0%";
    }
    calcWrapperHeight();
  }, [isScreenShare]);
  window.addEventListener("resize", () => {
    calcWrapperHeight();
  });

  console.log("allTiles", allTiles);
  const [lgWd, tileHeight] = getWidthRate(allTiles.length, wrapperHeight);
  const videos = allTiles.map((tile, idx) => (
    <Grid
      item
      lg={lgWd}
      key={`video-tile-${idx}`}
      style={{ height: tileHeight }}
      className={classes.tileGrid}
    >
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

  const getSharingTitle = () => {
    if (!sharingName) return "";
    if (sharingName === "YOU") {
      return "YOU are sharing screen";
    } else {
      return `${sharingName} is sharing screen`;
    }
  };

  const isNoVideo = videos.length < 1;
  console.log("sharingName", sharingName);

  return (
    <>
      <div id="shared-content-view" className={classes.screenview}>
        {isScreenShare && (
          <div id="share-content-view-nameplate">{getSharingTitle()}</div>
        )}
      </div>
      {!isScreenShare && (
        <Grid
          container
          justify={!isNoVideo ? "flex-start" : "center"}
          alignItems="flex-start"
          className={classes.videoTileWrapper}
          id="video-tile-wrapper"
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
