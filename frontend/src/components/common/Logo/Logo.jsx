import { Typography } from "antd";
const { Title } = Typography;

const Logo = () => {
  const logoStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#262626",
    letterSpacing: "-0.5px",
    cursor: "pointer",
  };
  return (
    <Title level={2} style={{ ...logoStyle, margin: 0 }}>
      D.E
    </Title>
  );
};

export default Logo;
