import { useEffect, useRef, useState } from "react";

function Terminal({ output, setShowTerminal }) {
  const terminalRef = useRef(null);
  const [height, setHeight] = useState(200);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(200);

  // Scroll terminal to the bottom every time new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Start resizing the terminal
  const startResizing = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  };

  // Handle resizing logic
  const resize = (e) => {
    if (isDragging.current) {
      const deltaY = startY.current - e.clientY;
      setHeight(Math.max(100, startHeight.current + deltaY)); // Prevent height from going below 100px
    }
  };

  // Stop resizing
  const stopResizing = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  };

  // Render terminal output
  const renderOutput = (text) => {
    // Remove ANSI color codes from the text (useful for cleaned text output)
    const cleanedText =
      typeof text === "string" ? text.replace(/\x1b\[[0-9;]*m/g, "") : text;

    // If the text is an array or object, pretty-print it
    if (Array.isArray(cleanedText) || typeof cleanedText === "object") {
      return (
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(cleanedText, null, 2)}
        </pre>
      );
    }

    // If the text is a string, check if it contains URLs and make them clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (typeof cleanedText === "string") {
      return cleanedText.split(urlRegex).map((part, index) =>
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
    }

    // For other types (numbers, booleans, etc.), just return the value
    return cleanedText;
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
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
        {/* Close Button (calls parent to hide) */}
        <button
          onClick={() => setShowTerminal(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "4px 10px",
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✖
        </button>

        {/* Resizer */}
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

        {/* Terminal Header */}
        <h4
          style={{
            margin: "0 0 10px 0",
            color: "#4CAF50",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Terminal
        </h4>

        {/* Render Output */}
        <pre>{renderOutput(output || "Press Run to execute your code...")}</pre>
      </div>
    </div>
  );
}

export default Terminal;
