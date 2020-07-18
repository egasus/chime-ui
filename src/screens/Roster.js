import React, { useMemo } from "react";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";

const muiStyles = () => ({
  rosterWrapper: {
    height: "calc(40% - 12px)",
    overflowY: "auto",
    border: "1px solid #ccc",
    width: "100%",
    marginBottom: 12,
  },
  roster: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
  },
  iconWrapper: {
    display: "flex",
  },
  rosterName: {
    fontSize: 15,
  },
});

const Roster = ({ MeetingManager, classes, rosters, allTiles }) => {
  console.log("allTiles-Roster", allTiles);
  const tileAttendeeIds = useMemo(
    () => allTiles.map((tile) => tile.attendeeId),
    [allTiles.length]
  );
  console.log("tileAttendeeIds", tileAttendeeIds);
  return (
    <div className={classes.rosterWrapper}>
      {rosters.map((roster, idx) => (
        <>
          <div className={classes.roster} key={`${idx}-roster`}>
            <Typography className={classes.rosterName}>
              {roster.name}
            </Typography>
            <div className={classes.iconWrapper}>
              <IconButton>
                {tileAttendeeIds.includes(roster.id) ? (
                  <VideocamIcon />
                ) : (
                  <VideocamOffIcon />
                )}
              </IconButton>
              <IconButton>
                {!roster.isMuted ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </div>
          </div>
          <hr key={`${idx}-roster-hr`} style={{ margin: 0 }} />
        </>
      ))}
    </div>
  );
};

export default withStyles(muiStyles)(Roster);
