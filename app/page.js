"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [message, setMessage] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [conversationData, setConversationData] = useState(null);

  // Function to start the chat
  const startChat = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/startChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "startChat" }),
      });

      if (!res.ok) {
        throw new Error("Failed to start chat");
      }

      const data = await res.json();
      setResponse("Chat started. Conversation ID: " + data.conversationId);
      setChatInfo({
        jwt: data.jwt,
        conversationId: data.conversationId,
        messageId: data.messageId,
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      setResponse("Error starting chat");
    } finally {
      setLoading(false);
    }
  };

  // Function to send a message
  const sendMessage = async () => {
    if (!chatInfo) {
      alert("Chat not started yet");
      return;
    }

    try {
      const res = await fetch("/api/startChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sendMessage",
          message,
          ...chatInfo,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();
      setResponse("Message sent: " + message);
    } catch (error) {
      console.error("Error sending message:", error);
      setResponse("Error sending message");
    }
  };

  // Function to poll for conversation completion
  const fetchConversationData = async (conversationId) => {
    try {
      const res = await fetch(
        `/api/fetchConversationData?conversationId=${conversationId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch conversation data");
      }

      const data = await res.json();
      setConversationData(data);
      setResponse("Conversation data fetched.");
    } catch (error) {
      console.error("Error fetching conversation data:", error);
    }
  };

  // Poll for conversation completion after a message is sent
  useEffect(() => {
    if (chatInfo && !loading) {
      const interval = setInterval(() => {
        fetchConversationData(chatInfo.conversationId);
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [chatInfo]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Start Genesys Chat</h1>
      <button
        onClick={startChat}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Starting Chat..." : "Start Chat"}
      </button>

      {response && (
        <div className="mt-4">
          <p>{response}</p>
        </div>
      )}

      {chatInfo && (
        <div className="mt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="px-4 py-2 border rounded text-black"
            placeholder="Type your message"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
          >
            Send Message
          </button>
        </div>
      )}

      {conversationData && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Conversation Data</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(conversationData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
