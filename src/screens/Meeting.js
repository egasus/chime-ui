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

const title = "title-333";
const name = "Johnsmith";
// const name = localStorage.getItem("email") || "johnsmith@gmail.com";
const region = "us-east-1";

class Meeting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      isMute: false,
      isVideo: true,
      isShare: false,
    };
  }

  async componentDidMount() {
    await MeetingManager.joinMeeting(title, name, region);
    this.setState({ loading: false });
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    // const id = this.props.match.params.id;
    const isInstructor = false;

    return (
      <div>
        <ControllBar
          isMute={this.state.isMute}
          isVideo={this.state.isVideo}
          isShare={this.state.isShare}
          setEnd={() => {
            if (isInstructor || false) {
              MeetingManager.endMeeting(title);
            } else {
              MeetingManager.leaveMeeting(title);
            }
          }}
          setIsMute={() => this.setState(({ isMute }) => ({ isMute: !isMute }))}
          setIsVideo={() =>
            this.setState(({ isVideo }) => ({ isVideo: !isVideo }))
          }
          setIsShare={() =>
            this.setState(({ isShare }) => ({ isShare: !isShare }))
          }
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
            <VideoManager MeetingManager={MeetingManager} />
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
