import {
  // AudioVideoFacade,
  // AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  DefaultActiveSpeakerPolicy,
  // ScreenShareViewFacade,
  // ScreenObserver,
} from "amazon-chime-sdk-js";

import debounce from "lodash/debounce";

import {
  createMeeting,
  endMeeting as endMeetingApi,
  getAttendee as getAttendeeApi,
} from "apis/chimeMeeting";

class MeetingManager {
  constructor(
    setTileToMuted,
    setAllTilesToInactiveSpeaker,
    setTilesToActiveSpeakers,
    removeMyTile
  ) {
    this.meetingSession = null;
    this.audioVideo = null;
    this.screenShareView = null;
    this.title = "";
    this.videoInputs = null;
    this.selectedVideoInput = null;
    this.isViewingSharedScreen = false;
    this.joinInfo = null;
    this.rosters = [];

    this.setTileToMuted = setTileToMuted;
    this.setAllTilesToInactiveSpeaker = setAllTilesToInactiveSpeaker;
    this.setTilesToActiveSpeakers = setTilesToActiveSpeakers;
    this.removeMyTile = removeMyTile;
  }

  async initializeMeetingSession(configuration) {
    const logger = new ConsoleLogger("DEV-SDK", LogLevel.ERROR);
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

    await this.setupDefaultAudioDevices();
  }
  async setupDefaultAudioDevices() {
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
  async stopLocalVideo() {
    if (this.videoInputs && this.videoInputs.length > 0) {
      console.log("stop-local-func");
      this.audioVideo.stopLocalVideoTile();
      await this.audioVideo.chooseVideoInputDevice(null);
      this.removeMyTile();
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

  async getAttendee(attendeeId) {
    const response = await getAttendeeApi(this.title, attendeeId);
    return response.Attendee.Name;
  }
  async joinMeeting(title, name, region) {
    const res = await createMeeting(title, name, region);
    this.title = res.JoinInfo.Title;
    this.joinInfo = res.JoinInfo;
    await this.initializeMeetingSession(
      new MeetingSessionConfiguration(
        res.JoinInfo.Meeting,
        res.JoinInfo.Attendee
      )
    );

    this.setupSubscribeToAttendeeIdPresenceHandler();
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

  bindAudioElement(ref) {
    this.audioVideo.bindAudioElement(ref);
  }
  unbindAudioElement() {
    this.audioVideo.unbindAudioElement();
  }

  setupSubscribeToAttendeeIdPresenceHandler() {
    const attendeeIdPresenceHander = (attendeeId, present) => {
      if (!present) {
        const rosterIndex = this.rosters.findIndex(
          (roster) => roster.id === attendeeId
        );
        if (rosterIndex >= 0) {
          this.rosters.splice(rosterIndex, 1);
        }
        return;
      }
      this.audioVideo.realtimeSubscribeToVolumeIndicator(
        attendeeId,
        debounce(async (attendeeId, volume, muted, signalStrength) => {
          this.setTileToMuted(attendeeId, muted);
          console.log("this.rosters", this.rosters);
          const rosterIndex = this.rosters.findIndex(
            (roster) => roster.id === attendeeId
          );
          if (rosterIndex < 0) {
            try {
              const attendeeInfo = await getAttendeeApi(this.title, attendeeId);
              this.rosters.push({
                id: attendeeId,
                name: attendeeInfo.Attendee.Name,
                volume: volume ? Math.round(volume * 100) : 0,
                isMuted: muted,
                isActive: false,
                signalStrength: signalStrength
                  ? Math.round(signalStrength * 100)
                  : 0,
              });
            } catch (error) {
              console.log("error-while-get-attendeeInfo", error);
            }
          } else {
            this.rosters[rosterIndex].volume = volume
              ? Math.round(volume * 100)
              : 0;
            this.rosters[rosterIndex].isMuted = muted;
            this.rosters[rosterIndex].signalStrength = signalStrength
              ? Math.round(signalStrength * 100)
              : 0;

            if (!this.rosters[rosterIndex].name) {
              const attendeeInfo = await getAttendeeApi(
                this.title,
                this.rosters[rosterIndex].id
              );
              this.rosters[rosterIndex].name = attendeeInfo.Attendee.Name;
            }
          }
        }, 300)
      );
    };
    const activeSpeakerHander = (attendeeIds) => {
      this.setAllTilesToInactiveSpeaker();
      this.setTilesToActiveSpeakers(attendeeIds);

      this.rosters.forEach((roster) => {
        roster.isActive = false;
      });

      for (const attendeeId of attendeeIds) {
        const index = this.rosters.findIndex(
          (roster) => roster.id === attendeeId
        );
        if (index >= 0) {
          this.rosters[index].isActive = true;
          break;
        }
      }
    };
    const scoresHander = (scores) => {
      for (const attendeeId in scores) {
        if (this.rosters[attendeeId]) {
          this.rosters[attendeeId].score = scores[attendeeId];
        }
      }
    };

    this.audioVideo.realtimeSubscribeToAttendeeIdPresence(
      attendeeIdPresenceHander
    );
    this.audioVideo.subscribeToActiveSpeakerDetector(
      new DefaultActiveSpeakerPolicy(),
      activeSpeakerHander,
      scoresHander,
      0
    );
  }
}

export default MeetingManager;
