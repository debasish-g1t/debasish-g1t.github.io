import React from "react";
import "./Intro.css";
import { WavyBackground } from "../ui/wavy-background.tsx";

import { introSub, introTitle } from "../../content/introContent.jsx";
import Reveal from "../ui/Reveal";


const IntroSection = () => {
    return (<>
        <div className="intro-container">
            <WavyBackground
                className="wave-container stackable"
                waveWidth={20}
                blur={2}
                waveOpacity={1}
            >
            </WavyBackground>
            <div className="text-container stackable">
                <Reveal as="h1">{introTitle}</Reveal>
                <Reveal as="h2" delay={150}>{introSub}</Reveal>
            </div>
            <Reveal as="div" className="arrow-container stackable" delay={300}>
                <img src={`${process.env.PUBLIC_URL}/assets/icons/downarrow-white.svg`} alt="" />
            </Reveal>
        </div>
    </>)
}

export default IntroSection
