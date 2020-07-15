import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "#fff",
    cursor: "pointer",
  },
}));

function ButtonAppBar({
  history,
  title,
  isMute,
  isVideo,
  isShare,
  isError,
  setIsVideo,
  setIsMute,
  setIsShare,
  setEnd,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            spacing="2"
          >
            <Grid item xs={3}>
              <Typography variant="h6" className={classes.title}>
                {title}
              </Typography>
            </Grid>
            <Grid container item xs={6} justify="space-around">
              <IconButton disabled={isError} onClick={setIsMute}>
                {isMute ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
              <IconButton disabled={isError} onClick={setIsVideo}>
                {isVideo ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton disabled={isError} onClick={setIsShare}>
                {isShare ? <ScreenShareIcon /> : <ScreenShareOffIcon />}
              </IconButton>
              <IconButton>
                <MoreHorizIcon />
              </IconButton>
              <IconButton disabled={isError} onClick={setEnd}>
                <EndIcon />
              </IconButton>
            </Grid>
            <Grid item xs={3} />
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
