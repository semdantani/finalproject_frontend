import { useState } from "react";

function RunJSButton({
  webContainer,
  fileTree,
  currentFile,
  setOutput,
  setShowTerminal,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");

  return (
    <div>
      <button
        style={{
          backgroundColor: isRunning ? "#888" : "rgb(180, 175, 175)",
          color: "black",
          fontWeight: "bold",
          padding: "10px 20px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "none",
          cursor: isRunning ? "not-allowed" : "pointer",
          position: "relative",
          transition: "background-color 0.2s, transform 0.1s",
          opacity: isRunning ? 0.7 : 1,
        }}
        disabled={isRunning}
        onClick={async () => {
          try {
            if (!webContainer) {
              setOutput("❌ WebContainer is not initialized.");
              setShowTerminal(true);
              return;
            }

            if (!currentFile) {
              setOutput("⚠️ No file selected.");
              return;
            }

            setIsRunning(true);
            setShowTerminal(true);
            setOutput("⏳ Mounting file system...");

            await webContainer.mount(fileTree);

            if (currentFile.endsWith(".js")) {
              setOutput(`🚀 Running: ${currentFile}\n`);
              const process = await webContainer.spawn("node", [currentFile]);

              const writableStream = new WritableStream({
                write(chunk) {
                  setOutput((prev) => prev + chunk + "\n");
                },
              });

              process.output.pipeTo(writableStream);
              await process.exit;
              setOutput((prev) => prev + "✅ Script execution finished.");
            } else {
              setOutput("⚠️ Unsupported file type.");
            }
          } catch (error) {
            setOutput("❌ Error: " + error.message);
          } finally {
            setIsRunning(false);
          }
        }}
      >
        {isRunning ? "Running..." : <i className="ri-play-large-fill"></i>}
      </button>
    </div>
  );
}

export default RunJSButton;
