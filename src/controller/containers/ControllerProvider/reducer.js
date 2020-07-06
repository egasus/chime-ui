export const Type = {
  MeetingJoined: "MEETING_JOINED",
  MeetingData: "MEETING_DATA",
  MeetingLeft: "MEETING_LEFT",
};

export const initialState = {
  activeMeeting: false,
  isSharingLocalVideo: false,
  isViewingSharedScreen: false,
};

export const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case Type.MeetingJoined:
      return {
        ...state,
        activeMeeting: true,
      };
    case Type.MeetingData:
      return {
        ...state,
        ...payload,
      };
    case Type.MeetingLeft:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};
