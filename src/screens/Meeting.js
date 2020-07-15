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
      event: null,
      title: props.match.params.id,
    };
  }

  async componentDidMount() {
    const { title } = this.state;
    const event = await getMeetingEvent(title);
    await MeetingManager.joinMeeting(title, name, region);
    this.setState({ loading: false, event: event.data }, () => {
      if (event.data.ch_instructor === name) {
        updateMeetingStatus(title, { ch_meeting_status: 1 });
      }
    });
  }

  render() {
    const { classes } = this.props;
    const { loading, event, title } = this.state;
    // const id = this.props.match.params.id;
    const isInstructor = event && event && event.ch_instructor === name;

    return (
      <React.Fragment>
        <ControllBar
          isMute={this.state.isMute}
          isVideo={this.state.isVideo}
          isShare={this.state.isShare}
          setEnd={() => {
            if (isInstructor) {
              MeetingManager.endMeeting(title);
              updateMeetingStatus(title, { ch_meeting_status: 2 });
            } else {
              MeetingManager.leaveMeeting(this.state.title);
            }
          }}
          setIsMute={() => {
            if (this.state.isMute) {
              this.setState({ isMute: false }, () =>
                MeetingManager.audioVideo.realtimeUnmuteLocalAudio()
              );
            } else {
              this.setState({ isMute: true }, () =>
                MeetingManager.audioVideo.realtimeMuteLocalAudio()
              );
            }
          }}
          setIsVideo={() => {
            if (this.state.isVideo) {
              MeetingManager.stopLocalVideo();
            }
            this.setState({ isVideo: !this.state.isVideo });
          }}
          setIsShare={() => {
            const { isShare } = this.state;
            this.setState({ isShare: !isShare });
            if (isShare) {
              MeetingManager.meetingSession.screenShare.stop();
            } else {
              MeetingManager.meetingSession.screenShare.start().then();
            }
          }}
        />
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

        {!loading && (
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
              <MeetingAudio MeetingManager={MeetingManager} />
              <VideoManager
                MeetingManager={MeetingManager}
                isScreenShare={this.state.isShare}
                handleScreenShareStoping={() =>
                  this.setState({ isShare: false })
                }
                isVideo={this.state.isVideo}
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
