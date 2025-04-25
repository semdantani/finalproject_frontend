import { useEffect, useRef, useState } from "react";

function Terminal({ output, setShowTerminal }) {
  const terminalRef = useRef(null);
  const [height, setHeight] = useState(200);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(200);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const startResizing = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  };

  const resize = (e) => {
    if (isDragging.current) {
      const deltaY = startY.current - e.clientY;
      setHeight(Math.max(100, startHeight.current + deltaY));
    }
  };

  const stopResizing = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  };

  const renderOutput = (text) => {
    // Remove ANSI color codes using a regular expression for strings
    const cleanedText =
      typeof text === "string" ? text.replace(/\x1b\[[0-9;]*m/g, "") : text;

    // If it's an array or object, stringify it with indentation
    if (Array.isArray(cleanedText) || typeof cleanedText === "object") {
      return (
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(cleanedText, null, 2)}
        </pre>
      );
    }

    // If it's a URL, wrap it in an anchor tag for clickable output
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

    // For simple values like numbers, booleans, or strings (without URLs)
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
        <h4 style={{ margin: "0 0 10px 0", color: "#4CAF50" }}>Terminal</h4>
        <pre>{renderOutput(output || "Press Run to execute your code...")}</pre>
      </div>
    </div>
  );
}

export default Terminal;
