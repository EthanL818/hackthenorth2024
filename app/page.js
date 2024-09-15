"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "next-themes";
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
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [conversationData, setConversationData] = useState(null);
  const [transcriptAnalysis, setTranscriptAnalysis] = useState("");
  const [analysisFetched, setAnalysisFetched] = useState(false);
  const [position, setPosition] = useState("conflict");

  // const { setTheme } = useTheme();
  const setTheme = (theme) =>
    theme === "dark" ? setDarkMode() : setLightMode();

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
    } catch (error) {
      console.error("Error fetching conversation data:", error);
    }
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center place-content-between px-4">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10 mx-8">
            <h1 className="text-xl font-bold">
              tr<span className="font-extrabold text-amber-500">ai</span>nt
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversations
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
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
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
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
                    <Button variant="outline">Change A.I. Agent</Button>
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
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <p className="mb-2">
                      Request has been sent to Genesys portal, make sure you are
                      on queue to receive!
                    </p>
                    {response}
                  </div>
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
                        {Math.floor(conversationData.sentimentScore * 100)}
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
