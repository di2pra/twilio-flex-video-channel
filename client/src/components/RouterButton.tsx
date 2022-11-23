import { ButtonProps } from "@twilio-paste/core";
import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props extends ButtonProps {
  to: string
  children: ReactNode
}

const RouterButton: React.FC<Props> = ({ to, children }) => {

  return (
    <NavLink to={to}>
      {children}
    </NavLink>
  )

}

export default RouterButton;