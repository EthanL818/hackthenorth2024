"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart,
  MessageSquare,
  RefreshCw,
  Moon,
  Sun,
  TrophyIcon,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [conversationData, setConversationData] = useState(null);
  const [transcriptAnalysis, setTranscriptAnalysis] = useState("");
  const [analysisFetched, setAnalysisFetched] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [position, setPosition] = useState("conflict");

  // const { setTheme } = useTheme();
  const setTheme = (theme) =>
    theme === "dark" ? setDarkMode() : setLightMode();

  const notify = () => alert("Request for agent transfer has been sent.");

  const setDarkMode = () => {
    document.documentElement.classList.add("dark");
    document.documentElement.style = "color-scheme: dark";
  };

  const setLightMode = () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style = "color-scheme: light";
  };

  const sentimentTrendColors = {
    NotCalculated: "text-gray-500",
    Declining: "text-red-500",
    SlightlyDeclining: "text-orange-500",
    NoChange: "text-yellow-500",
    SlightlyImproving: "text-blue-500",
    Improving: "text-green-500",
  };

  const leaderboardData = [
    { rank: 1, name: "Hayden Azan", score: 1250 },
    { rank: 2, name: "Ethan Liu", score: 1100 },
    { rank: 3, name: "Patrick Ye", score: 950 },
    { rank: 4, name: "Gigi Cheang", score: 800 },
  ];

  const startChat = async () => {
    setLoading(true);
    setChatInfo(null);
    setConversationData(null);
    setAnalysisFetched(false);

    try {
      const res = await fetch("/api/startChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "startChat", type: position }),
      });
      if (!res.ok) throw new Error("Failed to start chat");

      const data = await res.json();
      setResponse("ID: " + data.conversationId);
      setConversationId(data.conversationId);
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

  const fetchConversationData = async (conversationId) => {
    try {
      const res = await fetch(
        `/api/fetchConversationData?conversationId=${conversationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch conversation data");

      const data = await res.json();
      setConversationData(data);
      setResponse("Conversation data fetched.");
    } catch (error) {}
  };

  const fetchTranscriptAnalysis = async (conversationId) => {
    try {
      const res = await fetch(`/api/analyzeTranscript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (!res.ok) throw new Error("Failed to analyze transcript");

      const data = await res.json();
      setTranscriptAnalysis(data.analysis);
    } catch (error) {
      console.error("Error fetching transcript analysis:", error);
    }
  };

  const getGenesysToken = async () => {
    try {
      const res = await fetch("/api/getGenesysAccessToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      return res.json().access_token;
    } catch (error) {
      console.error("Error fetching Genesys access token:", error);
    }
  };

  const switchAgent = async (conversationId) => {
    if (!conversationId) {
      console.log("no conversation id");
      return;
    }
    /*
    try {
      const TEMP_AGENT_ID = "b292900c-d1ef-41d3-b505-d36f7fb5b0c4";
      const participants = await fetchConversationData(conversationId);
      console.log("Participants: ", participants);

      if (participants?.length > 1) {
        const replaceAgent = participants[1]?.participantId;

        const res = await fetch("/api/switchAgents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },

          // new agent hardcoded to transfer to Gigi for the demo
          body: JSON.stringify({
            auth: await getGenesysToken(),
            convo_id: conversationId,
            new_agent_id: TEMP_AGENT_ID,
            to_replace: replaceAgent,
          }),
        });
      } else {
        console.error("No available agent / agent has not interacted yet.");
        return;
      }
    } catch (error) {
      console.error("Error switching agents:", error);
    }
      */
  };

  useEffect(() => {
    if (conversationData && !analysisFetched) {
      fetchTranscriptAnalysis(conversationData.conversation.id);
      setAnalysisFetched(true);
    }
  }, [conversationData, analysisFetched]);

  useEffect(() => {
    if (chatInfo) {
      const interval = setInterval(() => {
        fetchConversationData(chatInfo.conversationId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [chatInfo]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b flex items-center border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 place-content-between px-4">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10 mx-8">
            <h1 className="text-xl font-bold">
              tr<span className="font-extrabold text-orange-600">ai</span>nt
            </h1>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light Theme
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark Theme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1 mx-5">
        <div className="container mx-auto py-6 md:py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-2xl font-bold">
                  Monthly Leaderboard
                </CardTitle>
                <TrophyIcon className="h-6 w-6 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">
                        Sentiment Score
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((user) => (
                      <TableRow key={user.rank}>
                        <TableCell className="font-medium">
                          {user.rank}
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="text-right">
                          {user.score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversations
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+679</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Sentiment Score
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+78.5</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Agents
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+4</div>
                <p className="text-xs text-muted-foreground">
                  +0 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Start Training Chat</CardTitle>
                <CardDescription>
                  Current A.I. Agent:{" "}
                  <span className="font-bold">
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="mr-4" onClick={startChat} disabled={loading}>
                  {loading
                    ? "Starting Chat..."
                    : conversationData
                    ? "Start another Chat"
                    : "Start Training Chat"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="mr-4">
                      Change A.I. Agent
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup
                      value={position}
                      onValueChange={setPosition}
                    >
                      <DropdownMenuRadioItem value="conflict">
                        Conflict
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="sales">
                        Sales
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem disabled value="informational">
                        Informational (WIP)
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {chatInfo && !conversationData && (
                  <>
                    <Button variant="destructive" onClick={notify}>
                      Transfer to Specialized Agent
                    </Button>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                      <p className="mb-2">
                        Request has been sent to Genesys portal, make sure you
                        are on queue to receive!
                      </p>
                      {response}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {conversationData && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    ID:{" "}
                    <span className="font-mono">
                      {conversationData.conversation.id}
                    </span>
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold">Sentiment Score</h3>
                      <p
                        className={`text-2xl font-bold ${
                          conversationData.sentimentScore > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {Math.floor(conversationData.sentimentScore * 100)}{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                          / 100
                        </span>{" "}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sentiment Trend</h3>
                      <p
                        className={`text-2xl font-bold ${
                          sentimentTrendColors[
                            conversationData.sentimentTrendClass
                          ]
                        }`}
                      >
                        {conversationData.sentimentTrendClass !==
                        "NotCalculated"
                          ? conversationData?.sentimentTrendClass
                              ?.replace(/([A-Z])/g, " $1")
                              .trim()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 markdown">
                    <ReactMarkdown>{transcriptAnalysis}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
