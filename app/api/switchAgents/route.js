export async function POST(req) {
  const { auth, convo_id, to_replace, new_agent_id } = req.json();

  const environment = "cac1.pure.cloud"; // Genesys environment

  const url = `https://api.${environment}/api/v2/conversations/calls/${convo_id}/participants/${to_replace}/replace`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      body: { user_id: new_agent_id },
    });

    if (!response.ok) {
      throw new Error("Failed to switch agents");
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
