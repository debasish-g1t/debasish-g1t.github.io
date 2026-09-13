import React, { useEffect, useState } from "react";
import "./MainTimeline.css";
import { TracingBeamTimeline } from "../IndivProject/TimeLineMain.jsx";
import { loadMainTimeline } from "../../content/mainTimelineLoader";
import Reveal from "../ui/Reveal";


const MainTimeline = () => {
    const [content, setContent] = useState(null);

    useEffect(() => {
        let mounted = true;
        loadMainTimeline().then((loaded) => {
            if (mounted) setContent(loaded);
        });
        return () => {
            mounted = false;
        };
    }, []);

    return (<>
        <div className="timeline-container">
            <Reveal as="h1">Timeline</Reveal>
            {content
                ? <TracingBeamTimeline content={content} />
                : <p className="timeline-loading">Loading timeline…</p>}
        </div>
    </>)
}

export default MainTimeline;
