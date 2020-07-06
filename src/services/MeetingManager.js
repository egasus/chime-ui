import {
  AudioVideoFacade,
  AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  ScreenShareViewFacade,
  ScreenObserver,
} from "amazon-chime-sdk-js";

import { createMeeting, endMeeting as endMeetingApi } from "apis/chimeMeeting";

const MeetingView = {
  REGULAR: "regular",
  GALLERY: "gallery",
  SCREEN_SHARE: "screen_share",
  DIRECT_CALL: "direct_call",
};
const BASE_URL = [
  window.location.protocol,
  "//",
  window.location.host,
  window.location.pathname.replace(/\/*$/, "/"),
].join("");

class MeetingManager {
  constructor() {
    this.meetingSession = null;
    this.audioVideo = null;
    this.screenShareView = null;
    this.title = "";
    this.videoInputs = null;
    this.selectedVideoInput = null;
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
    const videoInput = await this.audioVideo.listVideoInputDevices();
    const defaultVideo = videoInput[0];
    await this.audioVideo.chooseVideoInputDevice(defaultVideo);
    this.audioVideo.startLocalVideoTile();
  }

  stopLocalVideo() {
    this.audioVideo.stopLocalVideoTile();
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

  /**
   * Setup screen viewing
   */
  setupScreenViewing() {
    const self = this;
    this.meetingSession.screenShareView.registerObserver({
      streamDidStart(screenMessageDetail) {
        console.log("STREAM DID START", screenMessageDetail);
        self.screenSharing = true;
        self.changeView(MeetingView.SCREEN_SHARE);
        setTimeout(() => {
          self.screenSharingAttendeeId = screenMessageDetail.attendeeId;
          self.meetingSession.screenShareView.start(
            self.screenSharingElem.nativeElement
          );
        }, 3000);
      },
      streamDidStop(screenMessageDetail) {
        console.log("STREAM DID STOP", screenMessageDetail);
        self.screenSharing = false;
        self.screenSharingAttendeeId = null;
        self.changeView(self.defaultView);
        self.meetingSession.screenShareView.stop();
      },
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

    this.setupScreenViewing();
    this.audioVideo.addObserver(this);
    this.audioVideo.start();
    await this.meetingSession.screenShare.open().then();
    await this.meetingSession.screenShareView.open().then();
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
    const response = await fetch(
      `${BASE_URL}attendee?title=${encodeURIComponent(
        this.title
      )}&attendee=${encodeURIComponent(attendeeId)}`
    );
    const json = await response.json();
    return json.AttendeeInfo.Name;
  }

  bindAudioElement(ref) {
    this.audioVideo.bindAudioElement(ref);
  }

  unbindAudioElement() {
    this.audioVideo.unbindAudioElement();
  }
}

export default new MeetingManager();
