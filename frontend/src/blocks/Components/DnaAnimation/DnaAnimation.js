import React, { useEffect, useState } from "react";
import "./DnaAnimation.css";

const dnaPairs = 12;
const amplitudeX = 30;
const amplitudeY = 15;
const speed = 0.05;

const DnaAnimation = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      setTime((t) => t + speed);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const centerX = amplitudeX * 2;

  const getX = (index, invert = false) => {
    const phase = (index / dnaPairs) * Math.PI * 2;
    const angle = time + phase;
    const direction = invert ? 1 : -1;
    return centerX + amplitudeX * Math.sin(angle) * direction;
  };

  return (
    <div
      className="dna-container"
      style={{ width: centerX * 2, height: amplitudeY * dnaPairs + 40 }}
    >
      <div className="dna-flip">
        {[...Array(dnaPairs)].map((_, i) => {
          const y = amplitudeY * i + 20;

          const xLeft = getX(i, false);
          const xRight = getX(i, true);

          const linkX = (xLeft + xRight) / 2;
          const linkY = y;
          const deltaX = xRight - xLeft;
          const length = Math.abs(deltaX);

          return (
            <React.Fragment key={i}>
              <div className="dna-dot" style={{ top: y - 8, left: xLeft }} />
              <div className="dna-dot" style={{ top: y - 8, left: xRight }} />
              <div
                className="dna-link"
                style={{
                  top: linkY,
                  left: linkX,
                  width: length,
                  transform: `translate(-50%, -50%)`,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DnaAnimation;
