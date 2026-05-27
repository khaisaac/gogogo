"use client";

import { useEffect, useRef } from "react";

export default function TripAdvisorWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.getElementById("tripadvisor-script")) return;

    const script = document.createElement("script");
    script.id = "tripadvisor-script";
    script.src = "https://www.jscache.com/wejs?wtype=cdsratingsonlynarrow&uniq=278&locationId=10755003&lang=en_US&border=true&display_version=2";
    script.async = true;
    script.setAttribute("data-loadtrk", "");
    script.onload = function() {
      // @ts-ignore
      this.loadtrk = true;
    };
    
    if (widgetRef.current) {
        widgetRef.current.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById("tripadvisor-script");
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div ref={widgetRef} className="tripadvisor-widget-container" style={{ color: '#2e7d32', fontFamily: "'Georgia', 'Adventure', serif", marginTop: '8px', marginBottom: '16px' }}>
      <div id="TA_cdsratingsonlynarrow278" className="TA_cdsratingsonlynarrow">
        <ul id="Hmc8C3PbWS" className="TA_links GUEVKKhjO">
          <li id="vojYvBdN" className="l9E3vS7yFX9">
            <a target="_blank" href="https://www.tripadvisor.com/Attraction_Review-g3475390-d10755003-Reviews-Rinjani_Hero-Senaru_Lombok_West_Nusa_Tenggara.html" rel="noopener noreferrer">
              <img src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg" alt="TripAdvisor" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
