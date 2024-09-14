import WebSocket from "ws";
import util from "util";

// Genesys Configuration
const environment = "cac1.pure.cloud";
const orgId = "07d7213b-8d0e-4984-b806-5f416483b7d3";
const deploymentId = "c843036b-d7d8-451a-9087-557ee9820f74";
const queueName = "TestingQueue";
const displayName = "A.I. Customer Service Training Assistant";
const email = "ai@ai.com";

const routingTarget = {
  targetAddress: queueName,
  targetType: "QUEUE",
  priority: 2,
};

const memberInfo = {
  displayName: displayName,
  role: "CUSTOMER",
  customFields: {
    firstName: "A.I. Training Assistant",
    lastName: "",
    addressStreet: "",
    addressCity: "",
    addressPostalCode: "",
    addressState: "",
    phoneNumber: "",
    customField1Label: "",
    customField1: "",
    customField2Label: "",
    customField2: "",
    customField3Label: "",
    customField3: "",
    _genesys_source: "web",
    _genesys_referrer: "",
    _genesys_url:
      "https://developer.dev-genesys.cloud/developer-tools/#/webchat",
    _genesys_pageTitle: "Developer Tools",
    _genesys_browser: "Chrome",
    _genesys_OS: "Mac OS X",
    email: email,
    subject: "",
  },
};

// Start the guest chat
async function startGuestChat() {
  console.log("Starting guest chat...");

  const response = await fetch(
    `https://api.${environment}/api/v2/webchat/guest/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationId: orgId,
        deploymentId: deploymentId,
        routingTarget: routingTarget,
        memberInfo: memberInfo,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to start chat");
  }

  return response.json();
}

async function startVoiceflow(req) {
  const { user, action, message } = await req;

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
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// Send guest messages
async function sendGuestChat(jwt, conversationId, messageId, text) {
  console.log("Sending guest chat message:", text);

  const response = await fetch(
    `https://api.${environment}/api/v2/webchat/guest/conversations/${conversationId}/members/${messageId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        body: text,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  return response.json();
}

// WebSocket connection
function connectWebSocket(eventStreamUri, jwt, conversationId, messageId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(eventStreamUri);

    ws.on("open", () => {
      console.log(`Connected to ${eventStreamUri}`);
      resolve(ws);
    });

    ws.on("message", async (data) => {
      console.log(`Received message: ${data}`);

      if (!data) {
        return;
      }
      // Parse the incoming message from Genesys
      const incomingMessage = JSON.parse(data).body;

      // Forward the message to Voiceflow
      const voiceflowResponse = await startVoiceflow({
        user: conversationId,
        action: "launch",
      });

      const message = await voiceflowResponse[0]?.payload?.slate?.content[0]
        .children[0].text;

      if (message) {
        // Send the Voiceflow response back to Genesys
        await sendGuestChat(jwt, conversationId, messageId, message);
      }
    });

    ws.on("error", (err) => {
      reject(err);
    });
  });
}

// API Route Handler
export async function POST(req) {
  const { action, message, jwt, conversationId, messageId } = await req.json();

  console.log("Action:", action);

  try {
    if (action === "startChat") {
      // Start guest chat
      const chatResponse = await startGuestChat();
      const { id: conversationId, member, jwt, eventStreamUri } = chatResponse;
      const messageId = member.id;

      // Connect WebSocket
      await connectWebSocket(eventStreamUri, jwt, conversationId, messageId);

      // Send initial messages
      await sendGuestChat(jwt, conversationId, messageId, "Hello!");
      await sendGuestChat(
        jwt,
        conversationId,
        messageId,
        "I am an A.I. customer service training assistant."
      );

      return new Response(
        JSON.stringify({
          message: "Chat started successfully",
          conversationId,
          jwt,
          messageId,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else if (action === "sendMessage") {
      // Send guest message
      await sendGuestChat(jwt, conversationId, messageId, message);

      return new Response(
        JSON.stringify({
          message: "Message sent successfully",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
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
