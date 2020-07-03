import React, { useState } from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";

import bgImage from "assets/img/sidebar_cash.jpg";
import { withRouter } from "react-router";

const muiStyles = (theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage: `url(${bgImage})`,
    backgrondColor: "#3e72c1",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: "1",
  },
  image1: {
    position: "absolute",
    zIndex: "3",
    width: "100%",
    height: "100%",
    content: '""',
    display: "block",
    backgrondColor: "#2c5087",
    opacity: ".8",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

const Login = ({ classes, history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "johnsmith@gmail.com" && password === "pass123") {
      localStorage.setItem("token", "aaaa");
      localStorage.setItem("email", "johnsmith@gmail.com");
      history.push("/");
    }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={12} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={4} md={7} className={classes.image1} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Email"
              value={email}
              onChange={({ target: { value } }) => setEmail(value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              value={password}
              label="Password"
              type="password"
              onChange={({ target: { value } }) => setPassword(value)}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              disabled={!email || !password}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSubmit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {`Don't have an account? Sign Up`}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
    </Grid>
  );
};

Login.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(withRouter(Login));
