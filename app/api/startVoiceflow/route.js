export async function POST(req) {
  const { user, action, message } = await req.json();

  const api_key = process.env.VOICEFLOW_AGENT_API_KEY;
  const version_id = process.env.VOICEFLOW_VERSION_ID;

  const url = `https://general-runtime.voiceflow.com/state/user/${user}/interact`;

  try {
    let body;

    if (action === "launch") {
      body = {
        action: {
          type: "launch",
        },
      };
    } else if (action === "text") {
      body = {
        action: {
          type: "text",
          payload: message,
        },
      };
    } else {
      throw new Error("Invalid action");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${api_key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        versionID: version_id,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch voiceflow");
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
