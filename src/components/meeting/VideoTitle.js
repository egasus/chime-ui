import React, { useEffect, useRef } from "react";

const VideoTile = ({ bindVideoTile, nameplate, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    bindVideoTile(videoRef.current);
  }, [videoRef, bindVideoTile]);

  const classes = `VideoTile ${isLocal ? "VideoTile--local" : ""}`;
  return <video className={classes} ref={videoRef} />;
};

export default VideoTile;
