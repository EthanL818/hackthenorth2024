"use client";
import { useState, useEffect } from "react";
import Leaderboard from "./components/leaderboard";

export default function Home() {
  const users = [
    { name: "User 1", score: 1000 },
    { name: "User 2", score: 950 },
    { name: "User 3", score: 900 },
    { name: "User 4", score: 850 },
  ];

  const sentimentTrendColors = {
    NotCalculated: "text-gray-500",
    Declining: "text-red-500",
    SlightlyDeclining: "text-orange-500",
    NoChange: "text-yellow-500",
    SlightlyImproving: "text-blue-500",
    Improving: "text-green-500",
  };

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [message, setMessage] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [conversationData, setConversationData] = useState(null);

  // Function to start the chat
  const startChat = async () => {
    setLoading(true);

    // Reset chatInfo and conversationData to allow starting a new chat
    setChatInfo(null);
    setConversationData(null);

    try {
      const res = await fetch("/api/startChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "startChat" }),
      });
      if (!res.ok) throw new Error("Failed to start chat");

      const data = await res.json();
      setResponse("Conversation ID: " + data.conversationId);
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

  const sendMessage = async () => {
    if (!chatInfo) return alert("Chat not started yet");
    try {
      const res = await fetch("/api/startChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          message,
          ...chatInfo,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setResponse("Message sent: " + message);
    } catch (error) {
      console.error("Error sending message:", error);
      setResponse("Error sending message");
    }
  };

  const fetchConversationData = async (conversationId) => {
    try {
      const res = await fetch(
        `/api/fetchConversationData?conversationId=${conversationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch conversation data");

      const data = await res.json();
      setConversationData(data);
      setResponse("Conversation data fetched.");
    } catch (error) {
      console.error("Error fetching conversation data:", error);
    }
  };

  useEffect(() => {
    if (chatInfo) {
      const interval = setInterval(() => {
        fetchConversationData(chatInfo.conversationId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [chatInfo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-400">
        GenesysCloud A.I. Training Assistant
      </h1>

      {conversationData && (
        <div className="mt-8 mb-8 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold underline">
            Conversation Analysis
          </h2>
          <p className="mb-8">
            ID:{" "}
            <span className="italic">{conversationData.conversation.id}</span>
          </p>
          {conversationData.sentimentScore > 0 ? (
            <div className="mt-4">
              <h3 className="font-bold text-xl text-green-500">Great Job!</h3>
              <p className="mb-8">
                Customer sentiment score was generally positive during the
                training!
              </p>
              <div className="text-center">
                <h3 className="text-xl font-bold">Sentiment Score</h3>
                <h2 className="text-3xl text-green-500 font-bold">
                  +{Math.floor(conversationData.sentimentScore * 100)}
                </h2>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="font-bold text-xl text-red-500">
                Room for Improvement
              </h3>
              <p className="mb-8">
                Customer sentiment score was negative during the training.
              </p>
              <div className="text-center">
                <h3 className="text-xl font-bold">Sentiment Score</h3>
                <h2 className="text-3xl text-red-500 font-bold">
                  {Math.floor(conversationData.sentimentScore * 100)}
                </h2>
              </div>
            </div>
          )}

          {conversationData.sentimentTrendClass != "NotCalculated" ? (
            <>
              <p className="mt-8 font-bold text-xl">Sentiment Trend</p>
              <p
                className={`text-3xl font-bold ${sentimentTrendColors[conversationData.sentimentTrendClass]
                  }`}
              >
                {conversationData.sentimentTrendClass
                  .replace(/([A-Z])/g, " $1")
                  .trim()}
              </p>
            </>
          ) : (
            <>
              <p className="mt-8 font-bold text-xl">Sentiment Trend</p>
              <p className="text-3xl text-slate-500 font-bold">N/A</p>
            </>
          )}

          <pre className="bg-gray-700 p-4 rounded-lg mt-4 text-sm text-left">
            <code>{JSON.stringify(conversationData, null, 2)}</code>
          </pre>
        </div>
      )}

      <button
        onClick={startChat}
        className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        disabled={loading}
      >
        {loading
          ? "Starting Chat..."
          : conversationData
            ? "Start another Chat"
            : "Start Chat"}
      </button>

      {chatInfo && !conversationData && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-md">
          <p>{response}</p>
        </div>
      )}

      {chatInfo && !conversationData && (
        <div className="mt-6 flex flex-col gap-3 items-center w-full max-w-md">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-lg"
            placeholder="Type your message"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition"
          >
            Send Message
          </button>
        </div>
      )}
    </div>
  );
}
