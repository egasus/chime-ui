import React, { Component } from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import MeetingAudio from "components/meeting/MeetingAudio";
import VideoManager from "components/meeting/VideoManager";
import MeetingManager from "services/MeetingManager";
// import Controller from "controller/views/Controller";
import ControllBar from "./components/MeetingNavbar";

import { screenViewDiv } from "components/meeting/VideoManager";
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
      isVideo: true,
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
      <div>
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
          setIsMute={() => this.setState(({ isMute }) => ({ isMute: !isMute }))}
          setIsVideo={() =>
            this.setState(({ isVideo }) => ({ isVideo: !isVideo }))
          }
          setIsShare={() => {
            const { isShare } = this.state;
            this.setState({ isShare: !isShare });
            if (isShare) {
              // prev state
              MeetingManager.stopViewingScreenShare();
            } else {
              MeetingManager.startViewingScreenShare(screenViewDiv());
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
          <>
            <MeetingAudio MeetingManager={MeetingManager} />
            <VideoManager
              MeetingManager={MeetingManager}
              isScreenShare={this.state.isShare}
            />
          </>
        )}
      </div>
    );
  }
}

Meeting.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(Meeting);
