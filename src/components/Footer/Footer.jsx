import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <>
            <div className="footer-container">
                <div className="footer-bar "></div>
                <p
                    className="text-slate-500 footer-text"
                    style={{ color: "white" }}
                >
                    Made by Debasish Mohanty with ❤️
                </p>
            </div>
        </>
    )
}

export default Footer;
