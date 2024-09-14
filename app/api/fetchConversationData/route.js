export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  const environment = "cac1.pure.cloud"; // Genesys environment
  const accessToken = process.env.GENESYS_ACCESS_TOKEN; // Replace with a valid token

  const url = `https://api.${environment}/api/v2/speechandtextanalytics/conversations/${conversationId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch conversation data");
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
