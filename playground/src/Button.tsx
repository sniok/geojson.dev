import React, { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  children: ReactNode;
  onClick: any;
}
function Button({ icon, children, ...rest }: Props) {
  return (
    <button className="Button" {...rest}>
      {icon && <div className="Button__icon">{icon}</div>}
      {children}
    </button>
  );
}

export default Button;
