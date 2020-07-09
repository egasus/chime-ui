import React from "react";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import "./VideoGrid.css";

const muiStyles = () => ({
  mainGrid: {
    maxHeight: 900,
    overflowY: "auto",
  },
});

const VideoGrid = ({ children, size, classes }) => {
  return (
    <>
      <div id="shared-content-view" className="screenview unselectable">
        <div id="share-content-view-nameplate">No one is sharing screen</div>
      </div>
      <div className={`VideoGrid ${`VideoGrid--size-${size}`}`}>{children}</div>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.mainGrid}
      >
        {children}
      </Grid>
    </>
  );
};

export default withStyles(muiStyles)(VideoGrid);
