import React, {
  useEffect,
  useReducer,
  useRef,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useHistory } from "react-router-dom";
import MeetingManager from "services/MeetingManager";
import { initialState, reducer, Type as actionType } from "./reducer";
// import { Type as messageType } from "../../../controller/containers/ControllerProvider/reducer";
import { screenViewDiv } from "../VideoManager";

const RoomProviderDispatchContext = createContext(null);
const RoomProviderStateContext = createContext(null);

// const sendMessage = async (msg) => {
//   if (!window.deviceEnvironment) return;
//   console.log(`Sending message to controller ${msg.type}`);

//   const env = await window.deviceEnvironment;
//   env.sendMessage(msg);
// };

const RoomProvider = ({ children }) => {
  let history = useHistory();
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInitialized = useRef(false);

  const wrappedDispatch = useCallback((msg) => {
    messageHandler(msg);
  }, []);

  const messageHandler = async ({ type, payload }) => {
    console.log(
      `RoomProvider::messageHandler - Message received with type: ${type}`
    );

    try {
      switch (type) {
        case actionType.JoinMeeting:
          const { meetingId, name } = payload;
          if (!meetingId || !name) return;

          await MeetingManager.joinMeeting(meetingId, name);
          dispatch({ type: actionType.JoinMeeting });
          history.push("/meeting");
          break;
        case actionType.StartLocalVideo:
          MeetingManager.startLocalVideo();
          dispatch({ type: actionType.StartLocalVideo });
          break;
        case actionType.StopLocalVideo:
          MeetingManager.stopLocalVideo();
          dispatch({ type: actionType.StopLocalVideo });
          break;
        case actionType.LeaveMeeting:
          await MeetingManager.leaveMeeting();
          history.push("/");
          dispatch({ type: actionType.LeaveMeeting });
          break;
        case actionType.EndMeeting:
          await MeetingManager.endMeeting();
          history.push("/");
          dispatch({ type: actionType.EndMeeting });
          break;
        case actionType.StartScreenShareView:
          MeetingManager.startViewingScreenShare(screenViewDiv());
          dispatch({ type: actionType.StartScreenShareView });
          break;
        case actionType.StopScreenShareView:
          MeetingManager.stopViewingScreenShare();
          dispatch({ type: actionType.StopScreenShareView });
          break;
        default:
          console.log(`Unhandled incoming message: ${type}`);
          break;
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (!isInitialized.current) return;

    // if (state.activeMeeting) {
    //   sendMessage({ type: messageType.MeetingJoined });
    // } else {
    //   sendMessage({ type: messageType.MeetingLeft });
    // }
  }, [state.activeMeeting]);

  useEffect(() => {
    if (!isInitialized.current) return;

    // const { isSharingLocalVideo } = state;
    // sendMessage({
    //   type: messageType.MeetingData,
    //   payload: { isSharingLocalVideo },
    // });
  }, [state.isSharingLocalVideo]);

  useEffect(() => {
    if (!isInitialized.current) return;

    // const { isViewingSharedScreen } = state;
    // sendMessage({
    //   type: messageType.MeetingData,
    //   payload: { isViewingSharedScreen },
    // });
  }, [state.isViewingSharedScreen]);

  useEffect(() => {
    if (!window.deviceEnvironment) return;

    window.deviceEnvironment.then((env) => {
      env.init(messageHandler);
    });

    isInitialized.current = true;
  }, []);

  return (
    <RoomProviderStateContext.Provider value={state}>
      <RoomProviderDispatchContext.Provider value={wrappedDispatch}>
        {children}
      </RoomProviderDispatchContext.Provider>
    </RoomProviderStateContext.Provider>
  );
};

export function useRoomProviderDispatch() {
  const context = useContext(RoomProviderDispatchContext);
  if (context === undefined) {
    throw new Error("useRoomProviderDispatch must be used within a Provider");
  }
  return context;
}

export function useRoomProviderState() {
  const context = useContext(RoomProviderStateContext);
  if (context === undefined) {
    throw new Error("useRoomProviderState must be used within a Provider");
  }
  return context;
}

export default RoomProvider;
