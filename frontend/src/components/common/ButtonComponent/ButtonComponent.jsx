import React from "react";
import { Button } from "antd";
const ButtonComponent = ({
  size,
  styleButton,
  styleTextButton,
  textButton,
  ...rests
}) => {
  return (
    <>
    { textButton ? (
      <Button size={size} style={styleButton} {...rests}>
      <span style={styleTextButton}>{textButton}</span>
    </Button>
    ) : (
      <Button size={size} style={styleButton} {...rests} />
    )
  }
    </>
  );
};

export default ButtonComponent;
