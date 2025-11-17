import React from "react";
import { Button } from "antd";
import "./ButtonComponent.css";
const ButtonComponent = ({
  size,
  styleButton,
  styleTextButton,
  textButton,
  className,
  ...rests
}) => {
  return (
    <>
    { textButton ? (
      <Button size={size} style={styleButton} className={(className ? className + " " : "") + "btn-animated"}  {...rests}>
      <span style={styleTextButton}>{textButton}</span>
    </Button>
    ) : (
      <Button size={size} style={styleButton} className={(className ? className + " " : "") + "btn-animated"} {...rests} />
    )
  }
    </>
  );
};

export default ButtonComponent;
