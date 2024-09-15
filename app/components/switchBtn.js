export default function SwitchBtn({
  auth,
  convo_id,
  to_replace,
  new_agent_id,
}) {
  const [loading, setLoading] = useState(false);

  const switchReq = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/switchAgents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth,
          convo_id,
          to_replace,
          new_agent_id,
        }),
      });
      if (!res.ok) throw new Error("Failed to send request");
    } catch (error) {
      console.error("Error sending request:", error);
      setResponse("Error sending request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={switchReq}
      className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={loading}
    ></button>
  );
}
