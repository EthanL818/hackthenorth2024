// app/page.js (or pages/index.js in older Next.js projects)
"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const startChat = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/startChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to start chat");
      }

      const data = await res.json();
      setResponse(data.message);
    } catch (error) {
      console.error("Error starting chat:", error);
      setResponse("Error starting chat");
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
}
