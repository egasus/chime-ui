import React, { Component } from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";

import { CHIME_REGIONS } from "config/constants";

const muiStyles = () => ({
  paper: {
    width: "75%",
    maxWidth: 500,
  },
  dialogActions: {
    padding: "8px, 24px",
    marginLeft: 8,
    marginRight: 8,
  },
});

class StartMeeting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: "",
    };
  }

  isInstructor = (email) => email === localStorage.getItem("email");

  render() {
    const { open, event, classes, handleClose } = this.props;
    const { region } = this.state;
    const isToShow = this.isInstructor(event.ch_instructor);
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.paper }}
      >
        <DialogTitle>
          {isToShow ? "Start a meeting" : "Join meeting"}
        </DialogTitle>
        <DialogContent>
          <Grid container direction="column">
            {isToShow && (
              <Grid item xs={12}>
                <Typography color="primary">
                  Select Meeting Regions *
                </Typography>
                <TextField
                  required
                  value={region}
                  select
                  onChange={({ target: { value } }) =>
                    this.setState({ region: value })
                  }
                  fullWidth
                >
                  {CHIME_REGIONS.map(({ label, value }, idx) => (
                    <MenuItem key={`region-${idx}`} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {!isToShow && Number(event.ch_meeting_status) !== 1 && (
              <Typography color="primary">
                This meeting is not available (not started or canceled)
              </Typography>
            )}
            <br />
          </Grid>
          <br />
        </DialogContent>
        <DialogActions>
          <Grid
            container
            justify="space-between"
            wrap="nowrap"
            spacing="2"
            className={classes.dialogActions}
          >
            <Grid item xs={6}>
              <Button
                fullWidth
                key="CANCEL"
                size="medium"
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleClose();
                }}
              >
                CANCEL
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                key="Start & Close"
                size="medium"
                color="primary"
                variant="contained"
                onClick={() => {
                  handleClose();
                  window.open(`/meeting/${event.ch_event_uuid}`);
                }}
                disabled={
                  (isToShow && !region) ||
                  (!isToShow && Number(event.ch_meeting_status) !== 1)
                }
              >
                {isToShow ? "START" : "JOIN"}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
        <br />
      </Dialog>
    );
  }
}

StartMeeting.propTypes = {
  open: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default withStyles(muiStyles)(StartMeeting);
