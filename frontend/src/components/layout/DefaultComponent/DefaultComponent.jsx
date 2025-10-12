import React from 'react'
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderComponent from '../HeaderComponent/HeaderComponent'
import FooterComponent from '../FooterComponent/FooterComponent'

const DefaultComponent = ({children}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" }); // hoặc "smooth"
  }, [pathname]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
        <HeaderComponent />
        {children}
        <FooterComponent />
    </div>
  )
}

export default DefaultComponent