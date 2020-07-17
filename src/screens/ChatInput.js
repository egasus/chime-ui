import React, { useState } from "react";
// import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import AttachFileIcon from "@material-ui/icons/AttachFile";

const muiStyles = () => ({
  mainDiv: {
    display: "flex",
    alignItems: "center",
  },
  inputField: {
    height: "100%",
  },
});

const ChatInput = ({ MeetingManager, classes }) => {
  const [inputText, setInputText] = useState("");

  return (
    <div className={classes.mainDiv}>
      <IconButton>
        <AttachFileIcon />
      </IconButton>
      <TextField
        fullWidth
        className={classes.inputField}
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value);
        }}
        onKeyUp={(event) => {
          event.preventDefault();
          if (event.keyCode === 13) {
            const sendingMessage = inputText.trim();
            if (sendingMessage !== "") {
              MeetingManager.sendMessage(sendingMessage);
              setInputText("");
            }
          }
        }}
        InputProps={{ disableUnderline: true }}
        placeholder="Message All"
      />
    </div>
  );
};

export default withStyles(muiStyles)(ChatInput);
