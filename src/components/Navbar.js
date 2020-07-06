import React from "react";
import { withRouter } from "react-router";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "#fff",
    cursor: "pointer",
  },
}));

function ButtonAppBar({ history }) {
  const classes = useStyles();
  const isLoggedIn = !!localStorage.getItem("token");
  const isMeetingRoute = history.location.pathname.includes("meeting");

  return (
    isLoggedIn &&
    !isMeetingRoute && (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              className={classes.title}
              onClick={() => history.push("/")}
            >
              Home
            </Typography>
            <Button
              color="inherit"
              onClick={() => {
                if (isLoggedIn) {
                  localStorage.clear();
                  history.push("login");
                }
              }}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    )
  );
}

export default withRouter(ButtonAppBar);
