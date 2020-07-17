import React, { useEffect, useRef } from "react";
import moment from "moment";
import classNames from "classnames/bind";

import styles from "./Chat.css";
import ChatInput from "./ChatInput";

const cx = classNames.bind(styles);

const Chat = ({ MeetingManager, messages }) => {
  const bottomElement = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (bottomElement) {
        bottomElement.current.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 10);
  }, [messages]);
  console.log("messages===>", messages);

  return (
    <div className={cx("chat")}>
      <div className={cx("messages")}>
        {messages.map((message) => {
          const isSelf =
            message.attendeeId === MeetingManager.joinInfo.Attendee.AttendeeId;
          return (
            <div
              key={message.timestampMs}
              className={cx("messageWrapper", {
                me: isSelf,
              })}
            >
              <div
                className={cx("senderWrapper", {
                  me: isSelf,
                })}
              >
                <div className={cx("senderName")}>
                  {!isSelf ? message.senderName : "Me"}
                </div>
                <div className={cx("date")}>
                  {moment(message.timestampMs).format("h:mm A")}
                </div>
              </div>
              <div
                className={cx("message", {
                  me: isSelf,
                })}
              >
                {message.data}
              </div>
            </div>
          );
        })}
        <div className="bottom" ref={bottomElement} />
      </div>
      <div className={cx("chatInput")}>
        <ChatInput MeetingManager={MeetingManager} />
      </div>
    </div>
  );
};

export default Chat;
