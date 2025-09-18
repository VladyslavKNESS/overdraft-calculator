import React from "react";

const CustomButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  (props, ref) => {
    return <button ref={ref} {...props} />;
  }
);

CustomButton.displayName = "CustomButton"; // щоб React DevTools показував ім'я

export default CustomButton;