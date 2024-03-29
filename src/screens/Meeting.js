import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";

import MeetingAudio from "components/meeting/MeetingAudio";
import VideoManager from "components/meeting/VideoManager";
import MeetingManager from "services/MeetingManager";
// import Controller from "controller/views/Controller";
import ControllBar from "./components/MeetingNavbar";
import Chat from "./Chat";
import Roster from "./Roster";

import { getMeetingEvent, updateMeetingStatus } from "apis";
import map from "lodash/map";
import groupBy from "lodash/groupBy";

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
      allTiles: [],
      messages: [],
      rosters: [],
      isSelfSharing: false,
    };
    this.meetingManager = new MeetingManager(
      this.setTileToMuted,
      this.setAllTilesToInactiveSpeaker,
      this.setTilesToActiveSpeakers,
      this.removeMyTile,
      this.handleReceivedMsg,
      this.handleRosterUpdated
    );
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

  handleRosterUpdated = (data) => {
    const rosters = Object.entries(groupBy(data, "id")).map(
      ([key, value]) => value[0]
    );
    this.setState({ rosters });
  };
  addTile = (data) => {
    const { allTiles } = this.state;
    const index = allTiles.findIndex(
      (tile) => tile.attendeeId === data.attendeeId
    );
    if (index < 0) {
      allTiles.push(data);
      this.setState({ allTiles });
    }
  };
  removeTile = (tileId) => {
    const { allTiles } = this.state;
    const tileIndex = allTiles.findIndex((tile) => tile.tileId === tileId);
    if (tileIndex >= 0) {
      allTiles.splice(tileIndex, 1);

      this.setState({ allTiles });
    }
  };
  removeMyTile = () => {
    const { allTiles } = this.state;
    const tileIndex = allTiles.findIndex(
      (tile) =>
        tile.attendeeId === this.meetingManager.joinInfo.Attendee.AttendeeId
    );
    if (tileIndex >= 0) {
      allTiles.splice(tileIndex, 1);

      console.log("removeMyTile", allTiles);
      this.setState({ allTiles });
    }
  };
  setTileToMuted = (attendeeId, isMuted) => {
    const { allTiles } = this.state;
    const tileIndex = allTiles.findIndex(
      (tile) => tile.attendeeId === attendeeId
    );
    if (tileIndex >= 0) {
      allTiles[tileIndex].isMuted = isMuted;

      console.log("setTileToMuted", allTiles);
      this.setState({ allTiles });
    }
  };
  setAllTilesToInactiveSpeaker = () => {
    const { allTiles } = this.state;
    map(allTiles, (tile) => (tile.isActive = false));
    console.log("setAllTilesToInactiveSpeaker", allTiles);
    this.setState({ allTiles });
  };
  setTilesToActiveSpeakers = (attendeeIds) => {
    const { allTiles } = this.state;
    for (const attendeeId of attendeeIds) {
      const index = allTiles.findIndex(
        (tile) => tile.attendeeId === attendeeId
      );
      if (index >= 0) {
        allTiles[index].isActive = true;
        break;
      }
    }
    console.log("setTilesToActiveSpeakers", allTiles);
    this.setState({ allTiles });
  };
  handleReceivedMsg = (message) => {
    const { messages } = this.state;
    const { data, senderAttendeeId, timestampMs } = message;
    const updatedMessage = {
      data: new TextDecoder().decode(data),
      attendeeId: senderAttendeeId,
      senderName: this.meetingManager.getMsgSenderName(senderAttendeeId),
      timestampMs,
    };
    messages.push(updatedMessage);
    this.setState({ messages });
  };

  render() {
    const { classes } = this.props;
    const { loading, event, title, isError } = this.state;
    // const id = this.props.match.params.id;
    const isInstructor = event && event.ch_instructor === name;

    return (
      <React.Fragment>
        {event && (
          <ControllBar
            isError={isError}
            isMute={this.state.isMute}
            isVideo={this.state.isVideo}
            isShare={this.state.isShare}
            isSelfSharing={this.state.isSelfSharing}
            title={event && event.ch_title ? event.ch_title : ""}
            event={event}
            meetingStartTime={this.meetingManager.meetingStartTime}
            setEnd={async () => {
              if (isInstructor) {
                try {
                  await this.meetingManager.endMeeting(title);
                  updateMeetingStatus(title, { ch_meeting_status: 2 });
                  setTimeout(() => this.props.history.push("/"), 1000);
                } catch (error) {
                  console.log("error-while-end-meeting", error);
                }
              } else {
                this.meetingManager.leaveMeeting();
                this.props.history.push("/");
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
            setIsShare={async () => {
              const { isShare } = this.state;
              if (isShare) {
                try {
                  this.meetingManager.meetingSession.screenShare.stop();
                  this.setState({ isShare: false, isSelfSharing: false });
                } catch (error) {
                  console.log("error-while-off-sharing", error);
                }
              } else {
                try {
                  await this.meetingManager.meetingSession.screenShare.start();
                  this.setState({ isShare: true, isSelfSharing: true });
                } catch (error) {
                  console.log("error-while-on-sharing", error);
                }
              }
            }}
          />
        )}
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
              <Roster
                rosters={this.state.rosters}
                allTiles={this.state.allTiles}
              />
              <Chat
                MeetingManager={this.meetingManager}
                messages={this.state.messages}
              />
            </Grid>
            <Grid item lg={9} xs={12} className={classes.videoGrid}>
              <MeetingAudio MeetingManager={this.meetingManager} />
              <VideoManager
                addTile={this.addTile}
                removeTile={this.removeTile}
                allTiles={this.state.allTiles}
                MeetingManager={this.meetingManager}
                isScreenShare={this.state.isShare}
                handleScreenShareStoping={() =>
                  this.setState({ isShare: false })
                }
                setIsShare={(tOrF, callback) =>
                  this.setState({ isShare: tOrF }, callback)
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

export default withRouter(withStyles(muiStyles)(Meeting));
