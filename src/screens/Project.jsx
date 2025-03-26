import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import "highlight.js/styles/github.css"; // Try another theme if needed
import { getWebContainer } from "../config/webContainer";
import Panel1 from "../component/Panel1";
import Panel2 from "../component/Panel2";

const Project = () => {
  const location = useLocation();
  const [fileTree, setFileTree] = useState({});
  const [webContainer, setWebContainer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]); // New state variable for messages

  const [project, setProject] = useState(location.state.project);
  const [selectedUserId, setSelectedUserId] = useState(new Set());

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("WebContainer started");
      });
    }

    // Handle real-time project messages
    const handleProjectMessage = (data) => {
      console.log("New message received:", data);

      try {
        if (data.sender._id === "ai") {
          let message;

          try {
            message = JSON.parse(data.message);
            console.log("AI-generated message:", message);
          } catch (jsonError) {
            console.error("Failed to parse JSON:", jsonError);
            console.error("Problematic data:", data.message);
            message = {
              error: "Invalid JSON format",
              rawMessage: data.message,
            };
          }

          if (message.fileTree) {
            webContainer?.mount(message.fileTree);
            setFileTree((prevFileTree) => ({
              ...prevFileTree,
              ...message.fileTree, // Merge instead of replacing
            }));
          }

          setMessages((prevMessages) => [
            ...prevMessages,
            { ...data, message },
          ]);
        } else {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      } catch (error) {
        console.error("Unexpected error in handleProjectMessage:", error);
      }
    };

    // Attach WebSocket listeners
    receiveMessage("project-message", handleProjectMessage);
    receiveMessage("code-change", handleCodeChange);
    // Fetch project data
    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log("Project data:", res.data.project);
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      })
      .catch((err) => console.log("Error fetching project:", err));

    // Fetch all users
    axios
      .get("/users/all")
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log("Error fetching users:", err));

    return () => {
      // Cleanup: Remove WebSocket listeners and disconnect socket
      socket.off("project-message", handleProjectMessage);
      socket.off("code-change", handleCodeChange);
      socket.disconnect();
    };
  }, []);

  // Handle real-time code updates
  const handleCodeChange = (fileName, newContent) => {
    setFileTree((prevTree) => {
      if (prevTree[fileName]) {
        const updatedTree = {
          ...prevTree,
          [fileName]: {
            ...prevTree[fileName],
            file: {
              ...prevTree[fileName].file,
              contents: newContent,
            },
          },
        };

        // Save updated file tree to the database
        saveFileTree(updatedTree); // Pass the updated tree to saveFileTree
        return updatedTree;
      }
      return prevTree;
    });
  };

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="w-[400px]">
        <Panel1
          setIsModalOpen={setIsModalOpen}
          project={project}
          setMessages={setMessages}
          messages={messages}
          user={user}
        />
      </section>

      <section className="flex-1">
        <Panel2
          fileTree={fileTree}
          setFileTree={setFileTree}
          webContainer={webContainer}
          handleCodeChange={handleCodeChange}
        />
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full"
                aria-label="Close modal"
              >
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).indexOf(user._id) != -1
                      ? "bg-slate-200"
                      : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md ${
                selectedUserId.size > 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              disabled={selectedUserId.size === 0}
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
