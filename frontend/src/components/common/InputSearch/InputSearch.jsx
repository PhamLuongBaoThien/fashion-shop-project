// InputSearch.jsx
import { SearchOutlined } from "@ant-design/icons";
import InputComponent from "../InputComponent/InputComponent";

const InputSearch = ({
  value,
  onChange,
  // onSearch,
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
      <InputComponent
        value={value}
        onChange={onChange}
        // onPressEnter={(e) => onSearch(e.currentTarget.value)}
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
