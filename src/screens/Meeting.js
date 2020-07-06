import React, { Component } from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";

import MeetingAudio from "components/meeting/MeetingAudio";
import VideoManager from "components/meeting/VideoManager";
import MeetingManager from "services/MeetingManager";
import Controller from "controller/views/Controller";

// import { createMeeting } from "apis/chimeMeeting";

// import {
//   // AudioVideoFacade,
//   ConsoleLogger,
//   DefaultDeviceController,
//   DefaultMeetingSession,
//   LogLevel,
//   MeetingSessionConfiguration,
//   // ScreenMessageDetail,
//   // DefaultActiveSpeakerPolicy,
//   // AudioVideoObserver,
//   // DeviceChangeObserver,
//   // MeetingSessionVideoAvailability,
//   // ConnectionHealthData,
//   // MeetingSessionStatus,
//   // VideoTileState,
//   // ClientMetricReport,
// } from "amazon-chime-sdk-js";

// import "./style.css";

const muiStyles = () => ({});

// const MeetingView = {
//   REGULAR: "regular",
//   GALLERY: "gallery",
//   SCREEN_SHARE: "screen_share",
//   DIRECT_CALL: "direct_call",
// };
const title = "title-222";
const name = "Johnsmith";
// const name = localStorage.getItem("email") || "johnsmith@gmail.com";
const region = "us-east-1";

class Meeting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };

    // this.joinInfoMeeting = null;
    // this.audioVideo = null;
    // this.videoInputs = null;
    // this.selectedVideoInput = null;
    // this.meetingSession = null;
    // this.selectedAudioInput = null;

    // this.audioRef = React.createRef(null);
    // this.videoRef = React.createRef(null);
    // this.isMuted = false;
  }

  async componentDidMount() {
    await MeetingManager.joinMeeting(title, name, region);
    this.setState({ loading: false });
    // this.setupMeeting();
  }

  // fetchAndSetupCameraDevices() {
  //   this.audioVideo.listVideoInputDevices().then((videoInputs) => {
  //     this.videoInputs = videoInputs;
  //     if (this.videoInputs && this.videoInputs.length > 0) {
  //       this.selectedVideoInput = this.videoInputs[0];
  //     }
  //   });
  // }
  // setupScreenViewing() {
  //   const self = this;
  //   this.meetingSession.screenShareView.registerObserver({
  //     streamDidStart(screenMessageDetail) {
  //       console.log("STREAM DID START", screenMessageDetail);
  //       self.screenSharing = true;
  //       self.changeView(MeetingView.SCREEN_SHARE);
  //       setTimeout(() => {
  //         self.screenSharingAttendeeId = screenMessageDetail.attendeeId;
  //         self.meetingSession.screenShareView.start(
  //           self.screenSharingElem.nativeElement
  //         );
  //       }, 3000);
  //     },
  //     streamDidStop(screenMessageDetail) {
  //       console.log("STREAM DID STOP", screenMessageDetail);
  //       self.screenSharing = false;
  //       self.screenSharingAttendeeId = null;
  //       self.changeView(self.defaultView);
  //       self.meetingSession.screenShareView.stop();
  //     },
  //   });
  // }
  // setupMuteHandler() {
  //   const handler = (muted) => {
  //     console.log("IS MUTED", muted);
  //     this.isMuted = muted;
  //   };

  //   this.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio(handler);
  //   const isMuted = this.audioVideo.realtimeIsLocalAudioMuted();
  //   handler(isMuted);
  // }
  // setupMeeting = async () => {
  //   try {
  //     const res = await createMeeting(title, name, region);
  //     this.joinInfoMeeting = res.JoinInfo;
  //     console.log("joinInfo", this.joinInfoMeeting);
  //     // Initialize logger, deviceController, and configration
  //     const logger = new ConsoleLogger("ChimeMeetingLogs", LogLevel.INFO);
  //     const deviceController = new DefaultDeviceController(logger);
  //     const configuration = new MeetingSessionConfiguration(
  //       this.joinInfoMeeting.Meeting,
  //       this.joinInfoMeeting.Attendee
  //     );

  //     // Initialize DefaultMeetingSession
  //     this.meetingSession = new DefaultMeetingSession(
  //       configuration,
  //       logger,
  //       deviceController
  //     );

  //     // assign `audioVideo` data to public variable
  //     this.audioVideo = this.meetingSession.audioVideo;

  //     this.audioVideo.addDeviceChangeObserver(this);
  //     this.fetchAndSetupCameraDevices();

  //     this.audioVideo.listAudioInputDevices().then((audioInputs) => {
  //       if (audioInputs && audioInputs.length > 0) {
  //         this.audioInputs = audioInputs;
  //         this.selectedAudioInput = audioInputs[0];
  //         this.audioVideo
  //           .chooseAudioInputDevice(this.selectedAudioInput.deviceId)
  //           .then((res) => {
  //             this.audioVideo.bindAudioElement(this.audioRef.current);
  //             this.audioVideo.bindAudioElement(this.videoRef.current);
  //             this.setupMuteHandler();
  //             this.setupCanUnmuteHandler();
  //             this.setupScreenViewing();
  //             this.audioVideo.addObserver(this);

  //             // Start the meeting
  //             this.audioVideo.start();
  //             this.meetingSession.screenShare.open();
  //             this.meetingSession.screenShareView.open();
  //           });
  //       } else {
  //         alert("No Microphone found.");
  //       }
  //     });
  //   } catch (error) {
  //     console.log("error-start", error);
  //   }
  // };
  // switchAudioDevice(audioInput) {
  //   this.selectedAudioInput = audioInput;
  //   return (obs) => {
  //     this.audioVideo
  //       .chooseAudioInputDevice(this.selectedAudioInput.deviceId)
  //       .then((res) => {
  //         obs.next();
  //         obs.complete();
  //       });
  //   };
  // }
  // setupCanUnmuteHandler() {
  //   const handler = (canUnmute) => {
  //     console.log("CAN UNMUTE", canUnmute);
  //   };

  //   this.audioVideo.realtimeSubscribeToSetCanUnmuteLocalAudio(handler);
  //   handler(this.audioVideo.realtimeCanUnmuteLocalAudio());
  // }
  // setupDefaultAudioDevice() {
  //   return (obs) => {
  //     this.audioVideo.listAudioInputDevices().then((audioInputs) => {
  //       if (audioInputs && audioInputs.length > 0) {
  //         this.audioInputs = audioInputs;
  //         this.switchAudioDevice(audioInputs[0]).subscribe(() => {
  //           // Bind audio element
  //           this.audioVideo.bindAudioElement(this.audioRef.current);
  //           this.audioVideo.bindAudioElement(this.videoRef.current);
  //           this.setupMuteHandler();
  //           this.setupCanUnmuteHandler();
  //           obs.next();
  //           obs.complete();
  //         });
  //       } else {
  //         alert("No Microphone found.");
  //         obs.next();
  //         obs.complete();
  //       }
  //     });
  //   };
  // }

  render() {
    const { loading } = this.state;
    const id = this.props.match.params.id;
    // const classes = "VideoTile VideoTile--local";

    return (
      <div>
        <Controller />
        {loading && <div>{`Connecting to ${id}...`}</div>}
        {/* <audio ref={this.audioRef} style={{ display: "none" }}></audio>
        <video className={classes} ref={this.videoRef} /> */}

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
