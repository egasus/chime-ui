import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";

import Navbar from "./components/Navbar";
import Home from "./screens/Home";
import Login from "./screens/Login";

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
    <div>
      <Router history={history}>
        <Navbar />
        <Switch>
          <Route path="/login" component={Login} />
          <PrivateRoute path="/dashboard" component={Home} />
          <Redirect from="*" to="/dashboard" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
