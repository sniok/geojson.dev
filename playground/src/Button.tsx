import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
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
