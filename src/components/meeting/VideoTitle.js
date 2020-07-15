import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";

const muiStyles = (theme) => ({
  videoTile: {
    width: "100%",
    borderRadius: 10,
    border: "1px solid #ccc",
  },
});

const VideoTile = ({ bindVideoTile, nameplate, isLocal, classes }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    bindVideoTile(videoRef.current);
  }, [videoRef, bindVideoTile]);

  return <video className={classes.videoTile} ref={videoRef} />;
};

VideoTile.propTypes = {
  // bindVideoTile: PropTypes.func.isRequired,
  isLocal: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(VideoTile);
