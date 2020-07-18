import React from "react";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const TITLE_COLOR = "rgb(229,16,117)";
const muiStyles = () => ({
  durationLabel: {
    color: TITLE_COLOR,
    fontSize: 14,
    paddingRight: 6,
  },
  durationValue: {
    color: "#fff",
    fontSize: 14,
  },
  duration: {
    display: "flex",
  },
});

const MeetingDuration = ({ classes, label, value }) => (
  <div className={classes.duration}>
    <Typography className={classes.durationLabel}>{label}</Typography>
    <Typography className={classes.durationValue}>{value}</Typography>
  </div>
);

export default withStyles(muiStyles)(MeetingDuration);
