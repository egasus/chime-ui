import {
  // AudioVideoFacade,
  // AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  // ScreenShareViewFacade,
  // ScreenObserver,
} from "amazon-chime-sdk-js";

import {
  createMeeting,
  endMeeting as endMeetingApi,
  getAttendee as getAttendeeApi,
} from "apis/chimeMeeting";

// const MeetingView = {
//   REGULAR: "regular",
//   GALLERY: "gallery",
//   SCREEN_SHARE: "screen_share",
//   DIRECT_CALL: "direct_call",
// };

class MeetingManager {
  constructor() {
    this.meetingSession = null;
    this.audioVideo = null;
    this.screenShareView = null;
    this.title = "";
    this.videoInputs = null;
    this.selectedVideoInput = null;
    this.isViewingSharedScreen = false;
  }

  async initializeMeetingSession(configuration) {
    const logger = new ConsoleLogger("DEV-SDK", LogLevel.DEBUG);
    const deviceController = new DefaultDeviceController(logger);
    configuration.enableWebAudio = false;
    this.meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController
    );
    this.audioVideo = this.meetingSession.audioVideo;
    // TODO: Update ScreenShareView to use new introduced content-based screen sharing.
    this.screenShareView = this.meetingSession.screenShareView;

    await this.setupAudioDevices();
  }

  async setupAudioDevices() {
    const audioOutput = await this.audioVideo.listAudioOutputDevices();
    const defaultOutput = audioOutput[0] && audioOutput[0].deviceId;
    await this.audioVideo.chooseAudioOutputDevice(defaultOutput);

    const audioInput = await this.audioVideo.listAudioInputDevices();
    const defaultInput = audioInput[0] && audioInput[0].deviceId;
    await this.audioVideo.chooseAudioInputDevice(defaultInput);
  }

  registerScreenShareObservers(observer) {
    if (!this.screenShareView) {
      console.log("ScreenView not initialize. Cannot add observer");
      return;
    }
    this.screenShareView.registerObserver(observer);
  }

  addAudioVideoObserver(observer) {
    if (!this.audioVideo) {
      console.error("AudioVideo not initialized. Cannot add observer");
      return;
    }
    this.audioVideo.addObserver(observer);
  }

  removeMediaObserver(observer) {
    if (!this.audioVideo) {
      console.error("AudioVideo not initialized. Cannot remove observer");
      return;
    }

    this.audioVideo.removeObserver(observer);
  }

  removeScreenShareObserver(observer) {
    if (!this.screenShareView) {
      console.error("ScreenView not initialized. Cannot remove observer");
      return;
    }

    this.screenShareView.unregisterObserver(observer);
  }

  bindVideoTile(id, videoEl) {
    this.audioVideo.bindVideoElement(id, videoEl);
  }

  async startLocalVideo() {
    if (this.selectedVideoInput) {
      await this.audioVideo.chooseVideoInputDevice(this.selectedVideoInput);
      this.audioVideo.startLocalVideoTile();
    }
  }

  stopLocalVideo() {
    if (this.videoInputs && this.videoInputs.length > 0) {
      this.audioVideo.stopLocalVideoTile();
    }
  }

  async startViewingScreenShare(screenViewElement) {
    this.screenShareView
      .start(screenViewElement)
      .catch((error) => console.error(error));
  }

  stopViewingScreenShare() {
    this.screenShareView.stop().catch((error) => {
      console.error(error);
    });
  }

  fetchAndSetupCameraDevices() {
    this.audioVideo.listVideoInputDevices().then((videoInputs) => {
      this.videoInputs = videoInputs;
      if (this.videoInputs && this.videoInputs.length > 0) {
        this.selectedVideoInput = this.videoInputs[0];
      }
    });
  }

  async joinMeeting(title, name, region) {
    const res = await createMeeting(title, name, region);
    console.log("res", res);
    this.title = res.JoinInfo.Title;
    await this.initializeMeetingSession(
      new MeetingSessionConfiguration(
        res.JoinInfo.Meeting,
        res.JoinInfo.Attendee
      )
    );
    this.audioVideo.addDeviceChangeObserver(this);
    this.fetchAndSetupCameraDevices();

    this.audioVideo.addObserver(this);
    await this.meetingSession.screenShare.open().then();
    await this.meetingSession.screenShareView.open().then();

    this.audioVideo.start();
  }

  async endMeeting(title) {
    await endMeetingApi(title);
    this.leaveMeeting();
  }

  leaveMeeting() {
    this.stopViewingScreenShare();
    this.meetingSession.screenShareView.close();
    this.audioVideo.stop();
  }

  async getAttendee(attendeeId) {
    const response = await getAttendeeApi(this.title, attendeeId);
    return response.AttendeeInfo.Name;
  }

  bindAudioElement(ref) {
    this.audioVideo.bindAudioElement(ref);
  }

  unbindAudioElement() {
    this.audioVideo.unbindAudioElement();
  }
}

export default new MeetingManager();
