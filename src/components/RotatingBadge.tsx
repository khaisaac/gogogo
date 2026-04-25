"use client";

import { useEffect, useRef } from "react";
import styles from "./RotatingBadge.module.css";

interface RotatingBadgeProps {
  text?: string;
  size?: number;
}

export default function RotatingBadge({
  text = "TREKKING MOUNT RINJANI /// ",
  size = 200,
}: RotatingBadgeProps) {
  const textRef = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    // Repeat text to fill the circle
    if (textRef.current) {
      const repeatedText = text.repeat(2);
      textRef.current.textContent = repeatedText;
    }
  }, [text]);

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <div className={styles.inner}>
        <svg viewBox="0 0 200 200" className={styles.svg}>
          <defs>
            <path
              id="circlePath"
              d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
              fill="none"
            />
          </defs>
          <text className={styles.circleText}>
            <textPath
              ref={textRef}
              href="#circlePath"
              startOffset="0%"
            >
              {text.repeat(2)}
            </textPath>
          </text>
        </svg>

      </div>
    </div>
  );
}
