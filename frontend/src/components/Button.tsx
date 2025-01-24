import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  buttonType = "primary",
  type = "button",
  children,
  ...rest
}) => {
  return (
    <button
      type={type}
      {...rest}
      className={`rounded-[8px] p-2 ${
        buttonType === "primary" ? "bg-[#4E5BA6] text-white shadow-md" : ""
      } ${
        rest.disabled ? "bg-gray-100 cursor-not-allowed !text-gray-500" : ""
      } ${rest.className}`}
    >
      {children}
    </button>
  );
};

export default Button;
