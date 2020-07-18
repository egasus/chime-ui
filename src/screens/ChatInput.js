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
    height: "100%",
  },
  inputField: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    paddingRight: 40,
  },
  iconBtn: {
    borderRadius: "50%",
    backgroundColor: "rgb(171,171,171)",
    height: 30,
    width: 30,
    color: "#fff",
  },
  iconBtnWrapper: {
    paddingLeft: 10,
  },
});

const ChatInput = ({ MeetingManager, classes }) => {
  const [inputText, setInputText] = useState("");

  return (
    <div className={classes.mainDiv}>
      <div className={classes.iconBtnWrapper}>
        <IconButton className={classes.iconBtn}>
          <AttachFileIcon />
        </IconButton>
      </div>

      <TextField
        fullWidth
        align="center"
        className={classes.inputField}
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value);
        }}
        inputProps={{ min: 0, style: { textAlign: "center" } }}
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
