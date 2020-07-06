import React from "react";

import "./Button.css";

const Button = ({ children, active, ...rest }) => (
  <button className={`Button ${active ? "Button--active" : ""}`} {...rest}>
    {children}
  </button>
);

export default Button;
