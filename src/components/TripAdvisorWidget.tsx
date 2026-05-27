"use client";

export default function TripAdvisorWidget() {
  return (
    <div className="tripadvisor-widget-container" style={{ marginTop: '24px' }}>
      <iframe 
        src="/tripadvisor-widget.html" 
        style={{ 
          border: 'none', 
          width: '100%', 
          maxWidth: '300px',
          height: '150px', 
          overflow: 'hidden' 
        }}
        title="TripAdvisor Reviews"
        scrolling="no"
      />
    </div>
  );
}
