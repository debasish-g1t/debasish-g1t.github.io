import React, { useState } from "react";
import { TracingBeam } from "../ui/TracingBeam/TracingBeam.tsx";
import "./IndivProjectContainer.css";
import HDS from "../ui/HorizontalDragScroll/HDS.jsx";
import Reveal from "../ui/Reveal";

const toggleId = (expanded, setExpanded, id) => {
  if (id == null) return;
  setExpanded(
    expanded.includes(id)
      ? expanded.filter((e) => e !== id)
      : [...expanded, id]
  );
};

// Fallback simple renderers for optional `partners` / `speakers` data.
// Kept lightweight (no 3D tilt / motion) since the current content
// does not include these fields yet.
const PartnerCards = ({ elements }) => (
  <HDS>
    <div className="work-profile">
      {elements.map((item, index) => (
        <div key={index} className="work-profile-item">
          <a href={item.url} target="_blank" rel="noreferrer">
            {item?.logo && <img src={item.logo} alt="" className="link-img" />}
            <h4>{item.title}</h4>
            {item?.desc_text && <p>{item.desc_text}</p>}
          </a>
        </div>
      ))}
    </div>
  </HDS>
);

const SpeakerCards = ({ elements }) => (
  <HDS>
    <div className="work-profile">
      {elements.map((item, index) => (
        <div key={index} className="work-profile-item">
          {item?.img && <img src={item.img} alt={item?.title || ""} className="link-img" />}
          <h4>{item.title}</h4>
          {item?.degn && <p>{item.degn}</p>}
          {item?.linkedIn && (
            <a href={item.linkedIn} target="_blank" rel="noreferrer">
              LinkedIn →
            </a>
          )}
        </div>
      ))}
    </div>
  </HDS>
);

export function TracingBeamTimeline({ content }) {
  const row_tags = ["Date", "Time", "Location", "Status", "time-range"]
  const exp_tags = ["Organization", "Education", "Research Publication", "International Conference"]
  const [expanded, setExpanded] = useState([]);

  return (
    <>
      <TracingBeam className="px-6 mt-20">
        <div className="max-w-2xl mx-auto antialiased pt-4 relative">
          {content?.steps?.map((item, index) => (
            <Reveal key={`content-${index}`} className="mb-2">
              {(item?.badge || item?.type === "time-range") &&
                (row_tags.includes(item?.badge) || row_tags.includes(item?.type)) ?
                <>
                  <div className="tl-row-container">
                    {item?.time_text &&
                      <h1 className="time-text-content">
                        {item.time_text}
                      </h1>
                    }
                    {item?.badge &&
                      <h2 className="tl-badge-h2 text-white rounded-full text-sm w-fit px-4 py-1 mb-1">
                        {item.badge}
                      </h2>
                    }
                    {item?.date &&
                      <p className="text-l mb-4">
                        {item.date}
                      </p>
                    }
                    {item?.time &&
                      <p className="text-l mb-4">
                        {item.time}
                      </p>
                    }
                    {item?.location &&
                      <p className="text-l mb-4">
                        {item.location}
                      </p>
                    }
                    {item?.status &&
                      <p className="text-l mb-4" style={{ color: "green", fontWeight: 700 }}>
                        {item?.status}
                      </p>
                    }
                  </div>
                </>
                : item?.type === "exp" ?
                <>
                  <div className="tl-row-container">
                    {item?.badge &&
                      <h2
                        className={`tl-toggle tl-badge-h2 text-white rounded-full text-sm w-fit px-4 py-1 mb-1`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleId(expanded, setExpanded, item?.id)}
                      >
                        {item.badge}
                      </h2>
                    }
                    {item?.id != null &&
                      <p
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleId(expanded, setExpanded, item?.id)}
                      >
                        {expanded.includes(item.id) ? "←" : "→"}
                      </p>
                    }
                  </div>
                </>
                :
                <>
                  {item?.badge &&
                    <h2 className={`tl-badge-h2 bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-1 ${item?.badge === "Organization" ? "mt-5" : ""}`}>
                      {item.badge}
                    </h2>
                  }
                </>
              }
              {
                item?.break && (
                  <>
                    <div className="break-obj"></div>
                  </>
                )
              }
              {item?.title &&
                <div className="title-container">
                  <p className="text-xl mb-4">
                    {item.title}
                  </p>
                </div>
              }
              {item?.description &&
                <div className="title-container">
                  <p className="text-sm mb-4">
                    {item?.description}
                  </p>
                </div>
              }
              {item?.image && (
                <img
                  src={item.image}
                  alt=""
                  height="1000"
                  width="1000"
                  className="rounded-lg mb-10 object-cover"
                />
              )}
              {item?.partners && expanded.includes(item?.id) ?
                <PartnerCards elements={item?.partners} />
                : ""}

              {item?.speakers && expanded.includes(item?.id) ?
                <SpeakerCards elements={item?.speakers} />
                :
                ""
              }
              { exp_tags?.includes(item?.badge)
              ?
                <div className="org-container">
                  <div className="org-img-container">
                    <img src={item?.c_img} alt="" />
                  </div>
                  <div className="org-text-container">
                    {Object.keys(item?.o_detail || {}).map((key) => (
                      <React.Fragment key={key}>
                        <h2 className="tl-badge-h2 text-white rounded-full text-sm w-fit px-4 py-1 mt-1">
                          {key}
                        </h2>
                        <p>{item?.o_detail[key]}</p>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                :
                ""
              }
              {expanded.includes(item?.id) && item?.portfolio_profile?.length ?
                <HDS>
                  <div className="work-profile">
                    {item?.portfolio_profile?.map((p, index) => (
                      <div
                        key={index}
                        className="work-profile-item">
                        <h4>{p?.title}</h4>
                        <p>{p?.description}</p>
                        <div className="text-sm link-div prose prose-sm dark:prose-invert">
                          {p?.links?.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="link-a">
                              <div className="link-container">
                                {link?.image && <>
                                  <img src={link.image} alt="" className="link-img" />
                                </>}
                                {link?.title && <>
                                  <h5>{link.title}</h5>
                                </>}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </HDS>
                :
                ""
              }
              {item?.links && expanded.includes(item?.id) ?
                <div
                  className="text-sm  prose prose-sm dark:prose-invert">
                  {item.links.map((link, index) => {
                    return (
                      <div className="link-div" key={index}>
                        <a href={link.url} target="_blank" rel="noreferrer" className="link-a">
                          {link?.image && <>
                            <img src={link.image} alt="" className="link-img" />
                          </>}
                          {link?.text && <>
                            <p>{link.text}</p>
                          </>}
                        </a>
                      </div>
                    )
                  })}
                </div>
                : ""
              }
              {
                item?.show_links && (
                  <div
                    className="text-sm link-div prose prose-sm dark:prose-invert">
                    {item?.show_links.map((link, index) => {
                      return (
                        <div
                          key={index}
                          className="link-div">
                          <a href={link.url} target="_blank" rel="noreferrer" className="link-a">
                            {link?.image && <>
                              <img src={link.image} alt="" className="link-img" />
                            </>}
                            {link?.text && <>
                              <p>{link.text}</p>
                            </>}
                          </a>
                        </div>
                      )
                    })}
                  </div>
                )
              }
            </Reveal>
          ))}
        </div>
      </TracingBeam>
    </>
  );
}
