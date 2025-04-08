import { useState, useEffect, useRef } from "react";
import axios from "../config/axios";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrowNight } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function CodeReviewPanel({
  isOpen,
  setIsOpen,
  width,
  setWidth,
}) {
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [code, setCode] = useState("");
  const [isEditable, setIsEditable] = useState(true);
  const codeRef = useRef(null);

  // Handle mouse drag for resizing
  const handleMouseDown = () => setIsResizing(true);

  const handleInput = (e) => setCode(e.target.innerText);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = Math.min(
          1121,
          Math.max(300, window.innerWidth - e.clientX)
        );
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setWidth]);

  const formatReview = (text) => {
    return text
      .replace(/### /g, "") // Remove headers
      .replace(/\*\*\*|\*\*/g, "") // Remove bold formatting
      .replace(/`/g, "'") // Replace backticks with single quotes
      .replace(/^\- /gm, "→ ") // Replace dashes with arrows
      .replace(/(.{80})/g, "$1\n"); // Break long lines
  };

  const handleReview = async () => {
    const pastedCode = codeRef.current?.innerText.trim();
    if (!pastedCode) return alert("No code to review");

    setLoading(true);
    setIsEditable(false);

    try {
      const response = await axios.post("/ai/review-code", {
        code: pastedCode,
      });
      setReview(formatReview(response.data.feedback));
    } catch (error) {
      setReview("Error fetching review. Please try again.");
    }

    setLoading(false);
  };

  const handleEditAgain = () => {
    setReview("");
    setIsEditable(true);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed right-0 top-0 h-full bg-gray-900 text-white shadow-lg p-4 overflow-hidden"
      style={{ width: `${width}px`, maxWidth: "1140px" }}
    >
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg relative h-full">
        <h2 className="text-lg font-bold mb-4">AI Code Review</h2>

        <div className="absolute top-2 right-2 flex justify-start gap-2">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="bg-red-500 text-white px-3 py-1 rounded-md"
          >
            Close
          </button>

          {/* Review Button */}
          <button
            onClick={handleReview}
            disabled={loading || !isEditable}
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md"
          >
            {loading ? "Reviewing..." : "Review Code"}
          </button>

          {!isEditable && (
            <button
              onClick={handleEditAgain}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
            >
              Edit Again
            </button>
          )}
        </div>

        {/* Code Input / Review Display */}
        {isEditable ? (
          <pre
            ref={codeRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            className="mt-4 p-2 bg-gray-700 text-white rounded-lg whitespace-pre-wrap h-[95%] overflow-hidden border border-gray-500 no-scrollbar"
            style={{
              outline: "none",
              backgroundColor: "#1E1E1E",
            }}
            onInput={handleInput}
          >
            {code}
          </pre>
        ) : (
          <div
            className="mt-4 text-green-400 rounded-lg h-[95%] overflow-auto border border-gray-600 no-scrollbar break-words"
            style={{
              backgroundColor: "#1E1E1E",
              maxHeight: "80vh",
              padding: "10px",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            <SyntaxHighlighter language="javascript" style={tomorrowNight}>
              {review || "Loding...."}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 h-full w-4 cursor-ew-resize"
        onMouseDown={handleMouseDown}
      />
    </motion.div>
  );
}
