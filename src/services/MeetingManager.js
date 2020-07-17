import {
  // AudioVideoFacade,
  // AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  DefaultActiveSpeakerPolicy,
  DataMessage,
  AsyncScheduler,
  // ReconnectingPromisedWebSocket,
  // DefaultPromisedWebSocketFactory,
  // DefaultDOMWebSocketFactory,
  // FullJitterBackoff,
  // ScreenShareViewFacade,
  // ScreenObserver,
} from "amazon-chime-sdk-js";

import debounce from "lodash/debounce";

import {
  createMeeting,
  endMeeting as endMeetingApi,
  getAttendee as getAttendeeApi,
} from "apis/chimeMeeting";

// const WSS_MSG_URL = "wss://z9wdczxpa7.execute-api.us-east-1.amazonaws.com/Prod";
// const TOPIC = 'SET_HOST';

class MeetingManager {
  static WEB_SOCKET_TIMEOUT_MS = 10000;
  static DATA_MESSAGE_LIFETIME_MS = 300000;
  static TOPIC = "SET_HOST";
  constructor(
    setTileToMuted,
    setAllTilesToInactiveSpeaker,
    setTilesToActiveSpeakers,
    removeMyTile,
    handleReceivedMsg
  ) {
    this.meetingSession = null;
    this.audioVideo = null;
    this.screenShareView = null;
    this.title = "";
    this.videoInputs = null;
    this.selectedVideoInput = null;
    this.isViewingSharedScreen = false;
    this.joinInfo = null;
    this.configuration = null;
    this.rosters = [];
    this.lastMessageSender = null;
    this.lastReceivedMessageTimestamp = 0;

    // this.messagingSocket = null;
    this.messageUpdateCallbacks = [];

    this.setTileToMuted = setTileToMuted;
    this.setAllTilesToInactiveSpeaker = setAllTilesToInactiveSpeaker;
    this.setTilesToActiveSpeakers = setTilesToActiveSpeakers;
    this.removeMyTile = removeMyTile;
    this.handleReceivedMsg = handleReceivedMsg;
  }

  // joinRoomMessaging = async () => {
  //   if (!this.configuration) {
  //     console.log("configuration does not exist");
  //     return;
  //   }

  //   const messageUrl = `${WSS_MSG_URL}?MeetingId=${this.configuration.meetingId}&AttendeeId=${this.configuration.credentials.attendeeId}&JoinToken=${this.configuration.credentials.joinToken}`;
  //   this.messagingSocket = new ReconnectingPromisedWebSocket(
  //     messageUrl,
  //     [],
  //     "arraybuffer",
  //     new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
  //     new FullJitterBackoff(1000, 0, 10000)
  //   );

  //   await this.messagingSocket.open(MeetingManager.WEB_SOCKET_TIMEOUT_MS);

  //   this.messagingSocket.addEventListener("message", (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       const { attendeeId } = data.payload;

  //       let name;
  //       const roster = this.rosters.find((r) => r.id === attendeeId);
  //       if (roster) {
  //         name = roster.name;
  //       }
  //       this.publishMessageUpdate({
  //         type: data.type,
  //         payload: data.payload,
  //         timestampMs: Date.now(),
  //         name,
  //       });
  //     } catch (error) {
  //       console.log("error-message-listener", error);
  //     }
  //   });
  // };

  // sendMessage = (type, payload) => {
  //   if (!this.messagingSocket) {
  //     return;
  //   }

  //   const message = {
  //     message: "sendmessage",
  //     data: JSON.stringify({ type, payload }),
  //   };
  //   try {
  //     this.messagingSocket.send(JSON.stringify(message));
  //   } catch (error) {
  //     console.log("error-send-msg", error);
  //   }
  // };

  // subscribeToMessageUpdate = (callback) => {
  //   this.messageUpdateCallbacks.push(callback);
  // };
  // unsubscribeFromMessageUpdate = (callback) => {
  //   const index = this.messageUpdateCallbacks.indexOf(callback);
  //   if (index !== -1) {
  //     this.messageUpdateCallbacks.splice(index, 1);
  //   }
  // };
  // publishMessageUpdate = (message) => {
  //   for (let i = 0; i < this.messageUpdateCallbacks.length; i += 1) {
  //     const callback = this.messageUpdateCallbacks[i];
  //     callback(message);
  //   }
  // };

  async initializeMeetingSession(configuration) {
    const logger = new ConsoleLogger("DEV-SDK", LogLevel.DEBUG);
    const deviceController = new DefaultDeviceController(logger);
    configuration.enableWebAudio = false;
    this.meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController
    );
    this.configuration = configuration;
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

    this.setupDataMessage();
    this.audioVideo.addObserver(this);
    await this.meetingSession.screenShare.open().then();
    await this.meetingSession.screenShareView.open().then();

    this.audioVideo.start();
  }
  async endMeeting(title) {
    await endMeetingApi(title);
    this.leaveMeeting();
  }
  async leaveMeeting() {
    this.stopViewingScreenShare();
    this.meetingSession.screenShareView.close();
    this.audioVideo.stop();
    // try {
    //   await this.messagingSocket.close(MeetingManager.WEB_SOCKET_TIMEOUT_MS);
    // } catch (error) {
    //   console.log("error-close-msg-socket", error);
    // }
  }

  setupDataMessage() {
    this.meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(
      "SET_HOST",
      (dataMessage) => {
        this.dataMessageHandler(dataMessage);
      }
    );
  }
  dataMessageHandler(dataMessage) {
    if (!dataMessage.throttled) {
      // const isSelf = dataMessage.senderAttendeeId === this.meetingSession.configuration.credentials.attendeeId;
      if (dataMessage.timestampMs <= this.lastReceivedMessageTimestamp) {
        return;
      }
      this.lastReceivedMessageTimestamp = dataMessage.timestampMs;
      this.handleReceivedMsg(dataMessage);
    } else {
      console.log("Message is throttled. Please resend");
    }
  }
  sendMessage = (textToSend) => {
    // new AsyncScheduler().start(() => {
    if (!textToSend) {
      return;
    }
    this.meetingSession.audioVideo.realtimeSendDataMessage(
      "SET_HOST",
      new TextEncoder().encode(textToSend)
      // MeetingManager.DATA_MESSAGE_LIFETIME_MS
    );
    // echo the message to the handler
    this.dataMessageHandler(
      new DataMessage(
        Date.now(),
        MeetingManager.TOPIC,
        new TextEncoder().encode(textToSend),
        this.meetingSession.configuration.credentials.attendeeId,
        this.meetingSession.configuration.credentials.externalUserId
      )
    );
    // });
  };
  getMsgSenderName(attendeeId) {
    return (this.rosters.find((r) => r.id === attendeeId) || {}).name;
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
