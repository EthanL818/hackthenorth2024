export async function POST(req) {
  const environment = "cac1.pure.cloud"; // Genesys environment
  const username = process.env.GENESYS_USERNAME;
  const password = process.env.GENESYS_PASSWORD;

  const url = `https://login.${environment}/oauth/token`;
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch access token");
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
