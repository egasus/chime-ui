import React, { Component } from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";

import MeetingAudio from "components/meeting/MeetingAudio";
import VideoManager from "components/meeting/VideoManager";
import MeetingManager from "services/MeetingManager";
// import Controller from "controller/views/Controller";
import ControllBar from "./components/MeetingNavbar";

import { getMeetingEvent, updateMeetingStatus } from "apis";

const muiStyles = () => ({
  connectingDiv: {
    height: "75vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  connectingTypo: {
    paddingRight: 20,
  },
  layoutGrid: {
    height: "calc(100vh - 80px)",
    padding: 16,
  },
  msgGrid: {
    border: "1px solid #ccc",
    height: "100%",
  },
  videoGrid: {
    paddingLeft: 16,
    height: "100%",
  },
  errorDiv: {
    height: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

// const title = "title-333";
// const name = "Johnsmith";
const name = localStorage.getItem("email");
const region = "us-east-1";

class Meeting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      isMute: false,
      isVideo: false,
      isShare: false,
      isError: false,
      event: null,
      title: props.match.params.id,
    };
    this.meetingManager = MeetingManager;
  }

  async componentDidMount() {
    const { title } = this.state;
    const event = await getMeetingEvent(title);
    try {
      await this.meetingManager.joinMeeting(title, name, region);
    } catch (error) {
      console.log("error-join", error);
      this.setState({ loading: false, isError: true });
      return;
    }

    this.setState({ loading: false, event: event.data }, () => {
      if (event.data.ch_instructor === name) {
        updateMeetingStatus(title, { ch_meeting_status: 1 });
      }
    });
  }

  render() {
    const { classes } = this.props;
    const { loading, event, title, isError } = this.state;
    // const id = this.props.match.params.id;
    const isInstructor = event && event && event.ch_instructor === name;

    return (
      <React.Fragment>
        <ControllBar
          isError={isError}
          isMute={this.state.isMute}
          isVideo={this.state.isVideo}
          isShare={this.state.isShare}
          setEnd={() => {
            if (isInstructor) {
              this.meetingManager.endMeeting(title);
              updateMeetingStatus(title, { ch_meeting_status: 2 });
            } else {
              this.meetingManager.leaveMeeting(this.state.title);
            }
          }}
          setIsMute={() => {
            if (this.state.isMute) {
              this.setState({ isMute: false }, () =>
                this.meetingManager.audioVideo.realtimeUnmuteLocalAudio()
              );
            } else {
              this.setState({ isMute: true }, () =>
                this.meetingManager.audioVideo.realtimeMuteLocalAudio()
              );
            }
          }}
          setIsVideo={() => {
            // toggle video camera
            if (
              !this.meetingManager.videoInputs ||
              this.meetingManager.videoInputs.length < 1
            ) {
              alert("No camera device found. Please connect a camera");
              return;
            }
            if (
              this.meetingManager.videoInputs &&
              this.meetingManager.videoInputs.length > 0
            ) {
              this.setState({ isVideo: !this.state.isVideo }, () => {
                if (this.state.isVideo) {
                  this.meetingManager.startLocalVideo();
                } else {
                  this.meetingManager.stopLocalVideo();
                }
              });
            }
          }}
          setIsShare={() => {
            const { isShare } = this.state;
            this.setState({ isShare: !isShare });
            if (isShare) {
              this.meetingManager.meetingSession.screenShare.stop();
            } else {
              this.meetingManager.meetingSession.screenShare.start().then();
            }
          }}
        />
        {isError && (
          <div className={classes.errorDiv}>
            <Typography align="center">
              Oops, Something went wrong! Please try again later or try with new
              meeting event.
            </Typography>
          </div>
        )}
        {loading && (
          <div className={classes.connectingDiv}>
            <Typography
              variant="h6"
              align="center"
              className={classes.connectingTypo}
            >
              Connecting...
            </Typography>
            <CircularProgress color="secondary" />
          </div>
        )}

        {!loading && !isError && (
          <Grid
            container
            justify="flex-start"
            alignItems="flex-start"
            className={classes.layoutGrid}
          >
            <Grid item lg={3} xs={0} className={classes.msgGrid}>
              <Typography>Message All</Typography>
            </Grid>
            <Grid item lg={9} xs={12} className={classes.videoGrid}>
              <MeetingAudio MeetingManager={this.meetingManager} />
              <VideoManager
                MeetingManager={this.meetingManager}
                isScreenShare={this.state.isShare}
                handleScreenShareStoping={() =>
                  this.setState({ isShare: false })
                }
              />
            </Grid>
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

Meeting.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(Meeting);
