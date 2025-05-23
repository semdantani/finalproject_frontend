import { useState } from "react";
import { sendMessage } from "../config/socket";

const FileExplorer = ({
  fileTree,
  setFileTree,
  setCurrentFile,
  setOpenFiles,
  currentFile,
  openFiles,
}) => {
  const [newFileName, setNewFileName] = useState("");

  const isValidFileName = (name) => {
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(name) && name.includes(".");
  };

  const createFile = () => {
    const trimmedFileName = newFileName.trim();

    if (!trimmedFileName) {
      alert("File name cannot be empty!");
      return;
    }

    if (!isValidFileName(trimmedFileName)) {
      alert(
        "Invalid file name! Avoid special characters and include an extension."
      );
      return;
    }

    if (fileTree[trimmedFileName]) {
      alert("File already exists!");
      return;
    }

    setFileTree((prevTree) => ({
      ...prevTree,
      [trimmedFileName]: { file: { contents: "" } },
    }));

    setNewFileName("");
  };

  const deleteFile = (fileToDelete) => {
    setOpenFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToDelete)
    );

    setFileTree((prevTree) => {
      const updatedTree = { ...prevTree };
      delete updatedTree[fileToDelete];
      return updatedTree;
    });

    sendMessage("delete-file", { fileName: fileToDelete });

    if (currentFile === fileToDelete) {
      const remainingFiles = openFiles.filter((f) => f !== fileToDelete);
      setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
    }
  };

  return (
    <div
      style={{ border: "1px solid black" }}
      className="explorer h-full max-w-64 min-w-52 bg-gray-100 shadow-md border-r border-gray-300 md:w-1/4 w-full flex flex-col"
    >
      {/* File Tree */}
      <div className="file-tree w-full p-2 flex-1 overflow-auto">
        {Object.keys(fileTree).map((file, index) => (
          <div key={index} className="flex justify-between items-center">
            <button
              onClick={() => {
                setCurrentFile(file);
                setOpenFiles((prevFiles) =>
                  prevFiles.includes(file) ? prevFiles : [...prevFiles, file]
                );
              }}
              className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-white w-full border rounded-md shadow-sm transition-all duration-200 hover:bg-green-100 hover:shadow-md active:scale-95"
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(file);
                }}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                ❌
              </span>
              <p
                className="font-semibold text-lg truncate flex-1 text-left"
                style={{
                  maxWidth: "80%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file}
              </p>
            </button>
          </div>
        ))}
      </div>

      {/* Create File Input */}
      <div className="p-2 flex flex-wrap items-center gap-2 border-t bg-white">
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="Enter file name..."
          className="flex-1 p-2 border rounded-md"
        />
        <button
          onClick={createFile}
          style={{
            backgroundColor: "rgb(18, 140, 126)",
          }}
          className="text-white px-3 py-2 rounded-md"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default FileExplorer;
