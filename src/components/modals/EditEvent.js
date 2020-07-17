import React, { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import MultiSelect from "components/MultiSelect";

import { MOCK_USERS } from "config/constants";

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
  labelTypo: {
    fontSize: 14,
  },
});

const EditEvent = ({
  open,
  classes,
  event,
  handleClose,
  participants: allParticipants,
  onSave,
}) => {
  const [startDate, setStartDate] = useState(
    moment(event.ch_scheduled_start_date_time).format("YYYY-MM-DDTkk:mm")
  );
  const [endDate, setEndDate] = useState(
    moment(event.ch_scheduled_end_date_time).format("YYYY-MM-DDTkk:mm")
  );
  const [participants, setParticipants] = useState(event.ch_participants);
  const [title, setTitle] = useState(event.ch_title);
  const participantItems = allParticipants
    .map(({ email }) => email)
    .concat(MOCK_USERS)
    .filter((i) => i !== localStorage.getItem("email"));
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>Edit a meeting event</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          <Grid item xs={12}>
            <Typography color="primary" className={classes.labelTypo}>
              Meeting Title
            </Typography>
            <TextField
              required
              value={title}
              onChange={({ target: { value } }) => setTitle(value)}
              fullWidth
            />
          </Grid>
          <br />
          <Grid item xs={12}>
            <Typography color="primary" className={classes.labelTypo}>
              Start Date *
            </Typography>
            <TextField
              required
              value={startDate}
              type="datetime-local"
              onChange={({ target: { value } }) => setStartDate(value)}
              fullWidth
            />
          </Grid>
          <br />
          <Grid item xs={12}>
            <Typography color="primary" className={classes.labelTypo}>
              End Date *
            </Typography>
            <TextField
              required
              value={endDate}
              onChange={({ target: { value } }) => setEndDate(value)}
              type="datetime-local"
              fullWidth
            />
          </Grid>
          <br />
          <Grid item xs={12}>
            <Typography color="primary" className={classes.labelTypo}>
              Participants *
            </Typography>
            <MultiSelect
              required
              items={participantItems}
              currentValues={participants}
              handleChange={(value) => setParticipants(value)}
            />
          </Grid>
        </Grid>
        <br />
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
                // setEvent({});
                handleClose();
              }}
            >
              CANCEL
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              key="Save & Close"
              size="medium"
              color="primary"
              variant="contained"
              onClick={() => {
                onSave(
                  event.ch_event_uuid,
                  Object.assign(
                    {},
                    {
                      ch_scheduled_start_date_time: startDate,
                      ch_scheduled_end_date_time: endDate,
                      ch_participants: participants,
                      ch_title: title,
                      ch_instructor:
                        localStorage.getItem("email") || "test1@gmail.com",
                    }
                  )
                );
                // setEvent({});
                handleClose();
              }}
            >
              SAVE
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
      <br />
    </Dialog>
  );
};

EditEvent.propTypes = {
  open: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  participants: PropTypes.array.isRequired,
  event: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(EditEvent);
