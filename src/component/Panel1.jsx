import React from "react";
import { sendMessage } from "../config/socket";
import Markdown from "markdown-to-jsx";
import { useState, useRef, useEffect } from "react";
import hljs from "highlight.js";

const Panel1 = ({ setIsModalOpen, project, setMessages, messages, user }) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messageBox = React.createRef();

  function SyntaxHighlightedCode({ className, children }) {
    const ref = useRef(null);
    useEffect(() => {
      if (ref.current) {
        hljs.highlightElement(ref.current);
      }
    }, [children]); // Re-run when content changes
    return (
      <pre>
        <code ref={ref} className={className}>
          {children}
        </code>
      </pre>
    );
  }

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
  };
  function WriteAiMessage(message) {
    let messageObject;

    // Ensure 'message' is a string before parsing
    if (typeof message === "string") {
      try {
        messageObject = JSON.parse(message);
      } catch (error) {
        console.error("JSON parsing error:", error, message);
        messageObject = { text: "Error parsing AI response." };
      }
    } else {
      messageObject = message; // If it's already an object, use it directly
    }

    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject.text || "No response from AI"}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }
  return (
    <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
      <header
        style={{ backgroundColor: "rgb(165 ,182 ,186)" }}
        className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0"
      >
        <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
          <i className="ri-add-fill mr-1"></i>
          <p style={{ fontFamily: "serif" }}>Add collaborator</p>
        </button>
        <button
          onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          className="w-10 h-10 bg-gray-700 text-white rounded-full hover:bg-gray-900 flex items-center justify-center"
        >
          <i className="ri-group-fill"></i>
        </button>
      </header>
      <div
        style={{
          backgroundImage: "url('image/bg-chat.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative"
      >
        <div
          ref={messageBox}
          className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.sender._id === "ai" ? "max-w-80" : "max-w-52"
              } ${
                msg.sender._id == user._id.toString() && "ml-auto"
              }  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
            >
              <small className="opacity-65 text-xs">{msg.sender.email}</small>
              <div className="text-sm">
                {msg.sender._id === "ai" ? (
                  WriteAiMessage(msg.message)
                ) : (
                  <p>{msg.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 p-1 absolute bottom-0 w-full">
          <div
            style={{
              backgroundColor: "rgb(225,225,225)",
              borderRadius: "1rem",
            }}
            className="inputField w-full flex items-center"
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-4 border-none outline-none flex-grow rounded-l-full"
              type="text"
              placeholder="Enter message"
            />
          </div>
          <div>
            <button
              disabled={!message.trim()}
              style={{ backgroundColor: "rgb(18, 140, 126)" }}
              onClick={send}
              className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center ml-2 
                active:scale-75 active:rotate-12 transition-transform duration-300 ease-in-out"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </div>
      <div
        className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
          isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
        } top-0`}
      >
        <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
          <h1 className="font-semibold text-lg">Collaborators</h1>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-close-fill"></i>
          </button>
        </header>
        <div className="users flex flex-col gap-2">
          {project.users &&
            project.users.map((user, index) => {
              const userId = user._id || `user-${index}`;
              return (
                <div
                  key={userId}
                  className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                >
                  <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Panel1;
