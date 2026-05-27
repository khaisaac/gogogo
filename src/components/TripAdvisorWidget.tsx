"use client";

export default function TripAdvisorWidget() {
  return (
    <div className="tripadvisor-widget-container" style={{ marginTop: '8px', marginBottom: '0' }}>
      <iframe 
        src="/tripadvisor-widget.html" 
        style={{ 
          border: 'none', 
          width: '100%', 
          maxWidth: '250px',
          height: '105px', 
          overflow: 'hidden' 
        }}
        title="TripAdvisor Reviews"
        scrolling="no"
      />
    </div>
  );
}
