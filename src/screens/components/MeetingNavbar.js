import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";

import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import ScreenShareOffIcon from "@material-ui/icons/StopScreenShare";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import EndIcon from "@material-ui/icons/PowerSettingsNew";

import MeetingDuration from "./MeetingDuration";

import "./Navbar.css";

const TITLE_COLOR = "rgb(229,16,117)";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  instructor: {
    color: "#fff",
    fontSize: 20,
    fontWeight: 300,
    paddingRight: 12,
  },
  title: {
    color: TITLE_COLOR,
    fontSize: 20,
    fontWeight: 600,
  },
  appbar: {
    backgroundColor: "rgb(69,37,78)",
  },
  iconButton: {
    color: "#fff !important",
    fontSize: 12,
  },
  durationItem: {
    display: "flex",
    backgroundColor: "#000",
    borderRadius: 5,
    padding: 6,
    width: 280,
    justifyContent: "space-evenly",
  },
}));

function ButtonAppBar({
  title,
  isMute,
  isVideo,
  isShare,
  isSelfSharing,
  isError,
  event,
  meetingStartTime,
  setIsVideo,
  setIsMute,
  setIsShare,
  setEnd,
}) {
  const classes = useStyles();
  const [periodValue, setPeriodValue] = useState(0);

  const [startedTime, durationValue] = useMemo(() => {
    if (!meetingStartTime || !event.ch_scheduled_end_date_time) {
      return [null, null];
    }
    const meetingStart = moment(meetingStartTime).format("kk:mm A");
    const startTimestamp = moment(meetingStartTime).unix();
    const scheduledEndTimestamp = moment(
      event.ch_scheduled_end_date_time
    ).unix();
    const remainingMins = parseInt(
      (scheduledEndTimestamp - startTimestamp) / 60
    );
    return [meetingStart, remainingMins];
  }, [meetingStartTime, event.ch_scheduled_end_date_time]);

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setPeriodValue(periodValue + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [periodValue]);

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            spacing="2"
          >
            <Grid container item xs={3}>
              {event && event.ch_instructor && (
                <Typography variant="h6" className={classes.instructor}>
                  {event.ch_instructor}
                </Typography>
              )}
              <Typography variant="h6" className={classes.title}>
                {title}
              </Typography>
            </Grid>
            {/* <Grid item xs={3}>
              {/* {event && (<Typography variant="h6" className={classes.title}>
                  {event.ch_scheduled_start_date_time
                    ? event.ch_scheduled_start_date_time
                    : ""}
                </Typography>)} */}
            <Grid item xs={3}>
              <div className={classes.durationItem}>
                <MeetingDuration label="Started:" value={startedTime} />
                <MeetingDuration
                  label="Remaining:"
                  value={`${durationValue - periodValue} mins`}
                />
              </div>
            </Grid>
            <Grid item xs={3} />
            <Grid container item xs={3} justify="space-around">
              <IconButton
                disabled={isError}
                onClick={setIsMute}
                className={classes.iconButton}
              >
                {isMute ? <MicOffIcon /> : <MicIcon />} Mute
              </IconButton>
              <IconButton
                disabled={isError}
                onClick={setIsVideo}
                className={classes.iconButton}
              >
                {isVideo ? <VideocamIcon /> : <VideocamOffIcon />} Video
              </IconButton>
              <IconButton
                disabled={isError || (!isSelfSharing && isShare)}
                onClick={setIsShare}
                className={classes.iconButton}
              >
                {isShare ? <ScreenShareIcon /> : <ScreenShareOffIcon />} Screen
              </IconButton>
              <IconButton className={classes.iconButton}>
                <MoreHorizIcon /> More
              </IconButton>
              <IconButton
                disabled={isError}
                onClick={setEnd}
                className={classes.iconButton}
              >
                <EndIcon /> End
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  title: PropTypes.string,
  isMute: PropTypes.bool.isRequired,
  isVideo: PropTypes.bool.isRequired,
  isShare: PropTypes.bool.isRequired,
  isSelfSharing: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  setIsVideo: PropTypes.func.isRequired,
  setIsMute: PropTypes.func.isRequired,
  setIsShare: PropTypes.func.isRequired,
  setEnd: PropTypes.func.isRequired,
};

ButtonAppBar.defaultProps = {
  title: "Chime Meeting",
};

export default withRouter(ButtonAppBar);
