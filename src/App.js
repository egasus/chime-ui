import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";

import Navbar from "./components/Navbar";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Meeting from "./screens/Meeting";

const history = createBrowserHistory();

const PrivateRoute = ({ component: Component, ...Rest }) => (
  <Route
    {...Rest}
    render={(props) =>
      localStorage.getItem("token") ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

function App() {
  return (
    <Router history={history}>
      <Navbar />
      <Switch>
        <Route path="/meeting/:id" component={Meeting} />
        <Route path="/meeting" component={Home} />
        <Route path="/login" component={Login} />
        <PrivateRoute exact path="/dashboard" component={Home} />
        <Redirect from="/" to="/dashboard" />
      </Switch>
    </Router>
  );
}

export default App;
