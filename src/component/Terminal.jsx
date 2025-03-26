import { useEffect, useRef, useState } from "react";

function Terminal({ output }) {
  const terminalRef = useRef(null);
  const [height, setHeight] = useState(200); // Default terminal height
  const [isVisible, setIsVisible] = useState(true); // Track terminal visibility
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(200);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Start resizing when mouse is pressed on the resizer
  const startResizing = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  };

  // Adjust height dynamically while dragging
  const resize = (e) => {
    if (isDragging.current) {
      const deltaY = startY.current - e.clientY; // Invert movement
      setHeight(Math.max(100, startHeight.current + deltaY)); // Prevent shrinking too much
    }
  };

  // Stop resizing when mouse is released
  const stopResizing = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  };

  // Function to make links clickable in output
  const renderOutput = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      part.match(urlRegex) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "lightblue" }}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Close/Show Terminal Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: "absolute",
          top: "-35px",
          right: "10px",
          padding: "6px 12px",
          backgroundColor: isVisible ? "#d9534f" : "#5cb85c",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {isVisible ? "✖ Hide Terminal" : "🖥 Show Terminal"}
      </button>

      {isVisible && (
        <div
          ref={terminalRef}
          style={{
            width: "100%",
            height: `${height}px`,
            backgroundColor: "#1e1e1e",
            color: "white",
            padding: "10px",
            overflowY: "auto",
            fontFamily: "monospace",
            borderTop: "2px solid #444",
            position: "relative",
          }}
        >
          {/* Resizer Handle */}
          <div
            onMouseDown={startResizing}
            style={{
              height: "5px",
              cursor: "ns-resize",
              background: "#444",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          />
          <h4 style={{ margin: "0 0 10px 0", color: "#4CAF50" }}>Terminal</h4>
          <pre>
            {renderOutput(output || "Press Run to execute your code...")}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Terminal;
