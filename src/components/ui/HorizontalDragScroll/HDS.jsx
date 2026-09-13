import React, { useState, useRef } from "react";
import "./HDS.css";

const HDS = ({ children }) => {
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const sliderRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDown(true);
        sliderRef.current.classList.add('active');
        setStartX(e.nativeEvent.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDown(false);
        sliderRef.current.classList.remove('active');
    };

    const handleMouseUp = () => {
        setIsDown(false);
        sliderRef.current.classList.remove('active');
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.nativeEvent.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 0.5; // scroll-fast
        const newScrollLeft = scrollLeft - walk;
        setScrollLeft(newScrollLeft);  // Update state to trigger re-render
        sliderRef.current.scrollLeft = newScrollLeft;
    };

    

    return (
        <div className="grid-container">
            <main className="grid-item hds-main">
                <div className="hds-items"
                    ref={sliderRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {children}
                </div>
            </main>
        </div>
    );
};

export default HDS;