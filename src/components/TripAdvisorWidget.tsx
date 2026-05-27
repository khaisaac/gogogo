"use client";
import { useEffect, useRef } from 'react';

export default function TripAdvisorWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check if script is already injected in this container
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=726&locationId=10755003&lang=en_US&rating=true&nreviews=5&writereviewlink=true&popIdx=false&iswide=false&border=false&display_version=2";
    script.async = true;
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tripadvisor-widget-container" style={{ marginTop: '24px' }}>
      <div ref={containerRef} id="TA_selfserveprop726" className="TA_selfserveprop">
        <ul id="Pe1XyuZT" className="TA_links nSfL8Pjb">
          <li id="HaaVH0bX" className="PTsTj2ung7">
            <a target="_blank" href="https://www.tripadvisor.com/" rel="noopener noreferrer">
              <img src="https://www.tripadvisor.com/img/cdsi/img2/branding/150_logo-11900-2.png" alt="TripAdvisor"/>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
