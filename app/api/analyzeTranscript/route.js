import Groq from "groq-sdk";

async function getTranscriptData(conversationId) {
  const environment = "cac1.pure.cloud"; // Genesys environment
  const accessToken = process.env.GENESYS_OAUTH_TOKEN;
  const url = `https://api.${environment}/api/v2/conversations/chats/${conversationId}/messages`;

  console.log("Fetching transcript data from:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch conversation data");
    }

    const rawResponse = await response.text();
    console.log("Raw response:", rawResponse);

    const data = JSON.parse(rawResponse);
    console.log("Parsed response:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("Error fetching transcript data:", error);
    return { error: error.message };
  }
}

async function analyzeTranscript(transcript) {
  // intialize groq object
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `Explain the areas of improvement in the following conversation transcript.
  Give the information as concisely as possible, and relate it to the transcript as much as possible.
  Try to give examples, and format it in a list. Additionally, you may use markdown for styling. 
  Ensure to give positive, constructive feedback such that the agent is able to improve their 
  performance and easily map out their next steps: ${transcript}`;

  // create a new completion
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-8b-8192",
  });

  return chatCompletion.choices[0]?.message?.content || "";
}

export async function POST(req) {
  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: "Conversation ID is required" }),
        { status: 400 }
      );
    }

    // Fetch the transcript from Genesys API
    const transcriptData = await getTranscriptData(conversationId);

    if (transcriptData.error) {
      return new Response(JSON.stringify({ error: transcriptData.error }), {
        status: 500,
      });
    }

    // Format the transcript for analysis
    const transcript = transcriptData.entities
      .filter((msg) => msg.body) // Filter out messages without a body
      .map((msg) => `${msg.sender.id}: ${msg.body}`) // Format the message
      .join("\n");

    console.log("Transcript:", transcript);
    const analysis = await analyzeTranscript(transcript);
    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to process request",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
