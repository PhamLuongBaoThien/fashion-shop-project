// InputSearch.jsx
import { SearchOutlined } from "@ant-design/icons";
import InputComponents from "../InputComponent/InputComponents";

const InputSearch = ({
  value,
  onChange,
  placeholder,
  className = "",
  style = {},
}) => {
  const baseStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid #f0f0f0",
    ...style,
  };

  return (
    <div className={className}>
      <InputComponents
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        prefix={
          <SearchOutlined
            style={{
              color: "#bfbfbf",
              
            }}
          />
        }
        style={{ ...baseStyle }}
      />
    </div>
  );
};

export default InputSearch;
