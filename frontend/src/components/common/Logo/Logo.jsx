import { Typography } from "antd";
import { Link } from "react-router-dom";
import "./Logo.css";
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
    <Link to="/" className="logo-link-wrapper">
    <Title level={2} style={{ ...logoStyle, margin: 0 }} className="logo-text">
      D.E
    </Title>
    </Link>
  );
};

export default Logo;
