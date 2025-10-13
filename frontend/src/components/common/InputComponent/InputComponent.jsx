import React from "react";
import { Input } from "antd";

const InputComponent = ({ size, placeholder, bordered, style, type, ...rests }) => {
  const InputElement = type === "password" ? Input.Password : Input;
  return (
    <InputElement size={size} placeholder={placeholder} style={style} {...rests} />
  );
};

export default InputComponent;
