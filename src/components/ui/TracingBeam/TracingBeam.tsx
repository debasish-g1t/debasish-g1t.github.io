import React from "react";
import "./TracingBeam.css";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`trace-container relative w-full max-w-4xl mx-auto h-full ${className ?? ""}`}>
      <div className="trace-rail-wrap" aria-hidden="true">
        <span className="trace-head" />
        <span className="trace-rail" />
      </div>
      <div>{children}</div>
    </div>
  );
};
