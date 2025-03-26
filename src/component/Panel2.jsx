import React from "react";
import { useState, useEffect } from "react";
import { sendMessage } from "../config/socket";
import CodeReviewPanel from "./CodeReviewPanel";
import Editor from "@monaco-editor/react";
import FileExplorer from "./FileExplorer";
import RunJSButton from "./RunJSButton";
import Terminal from "./Terminal";

const Panel2 = ({
  fileTree,
  setFileTree,
  webContainer,
  handleCodeChange,
  code,
}) => {
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [output, setOutput] = useState("");
  const [reviewPanelWidth, setReviewPanelWidth] = useState(400);
  const [showTerminal, setShowTerminal] = useState(false);

  const [isCodeReviewOpen, setIsCodeReviewOpen] = useState(false);

  const getLanguageFromFileName = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase(); // Ensure case-insensitive matching
    switch (extension) {
      // Common programming languages
      case "js":
        return "javascript";
      case "jsx":
        return "javascript";
      case "ts":
        return "typescript";
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "java":
        return "java";
      case "c":
        return "c";
      case "cpp":
        return "cpp";
      case "cs":
        return "csharp";
      case "go":
        return "go";
      case "rb":
        return "ruby";
      case "php":
        return "php";
      case "swift":
        return "swift";
      case "kt":
        return "kotlin";
      case "rs":
        return "rust";

      // Web development
      case "html":
        return "html";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "sass":
        return "sass";
      case "less":
        return "less";
      case "vue":
        return "vue";
      case "svelte":
        return "svelte";

      // Data formats
      case "json":
        return "json";
      case "xml":
        return "xml";
      case "yaml":
        return "yaml";
      case "yml":
        return "yaml";
      case "toml":
        return "toml";
      case "csv":
        return "csv";

      // Scripting and configuration
      case "sh":
        return "shell";
      case "bash":
        return "shell";
      case "zsh":
        return "shell";
      case "ps1":
        return "powershell";
      case "bat":
        return "bat";
      case "ini":
        return "ini";
      case "conf":
        return "ini";
      case "env":
        return "ini";

      // Markup and documentation
      case "md":
        return "markdown";
      case "txt":
        return "plaintext";

      // Database
      case "sql":
        return "sql";

      // Other
      case "dockerfile":
        return "dockerfile";
      case "makefile":
        return "makefile";
      case "gitignore":
        return "plaintext"; // No specific language for .gitignore

      // Default
      default:
        return "plaintext";
    }
  };

  return (
    <section className="right bg-red-50 flex-grow h-full flex flex-wrap">
      {/* Explorer Panel */}
      <FileExplorer
        fileTree={fileTree}
        setFileTree={setFileTree}
        setCurrentFile={setCurrentFile}
        setOpenFiles={setOpenFiles}
        currentFile={currentFile}
        openFiles={openFiles}
      />

      {/* Code Editor Panel */}
      <div className="code-editor flex flex-col flex-grow h-full shrink w-full md:w-2/4">
        {/* Open Files Header */}
        <div
          style={{ backgroundColor: "rgb(165,182,187)" }}
          className="top flex justify-between w-full flex-wrap"
        >
          {/* Run Button */}
          <div className="actions flex gap-2">
            <RunJSButton
              webContainer={webContainer}
              fileTree={fileTree}
              currentFile={currentFile}
              setOutput={setOutput}
              setShowTerminal={setShowTerminal} // ✅ Pass this to show terminal on Run
            />
            <button
              style={{
                backgroundColor: "rgb(229, 134, 134)",
                color: "black",
                fontWeight: "bold",
                padding: "10px 20px",

                display: "flex",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "none",
                cursor: "pointer",
                position: "absolute", // Add this
                top: "0", // Add this
                right: "0", // Add this
                transition: "background-color 0.2s, transform 0.1s",
              }}
              onClick={() => setIsCodeReviewOpen(true)}
            >
              Code Review
            </button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div
          className="bottom flex flex-grow w-full shrink overflow-auto "
          style={{
            backgroundColor: "#1e1e1e",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {fileTree[currentFile] && (
            <div
              className="code-editor-area h-full overflow-auto flex-grow bg-slate-50 mt-2 rounded-md shadow-inner"
              style={{
                height: "100%",
                width: "100%",
                overflow: "auto",
              }}
            >
              <Editor
                height="100%"
                width="100%"
                language={getLanguageFromFileName(currentFile)}
                theme="vs-dark"
                value={fileTree[currentFile]?.file?.contents || ""}
                onChange={(newValue) => handleCodeChange(currentFile, newValue)}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          )}
        </div>
        {showTerminal && <Terminal output={output} />}
      </div>

      {/* Output Panel (Responsive) */}

      <CodeReviewPanel
        width={reviewPanelWidth}
        setWidth={setReviewPanelWidth}
        code={code}
        isOpen={isCodeReviewOpen}
        setIsOpen={setIsCodeReviewOpen}
      />
    </section>
  );
};

export default Panel2;
