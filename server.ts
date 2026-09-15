import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Initialize Gemini SDK with User-Agent header
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Provat Barta Editorial Backend",
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Audio Transcription endpoint using gemini-3.5-transcribe
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio, mimeType } = req.body;
      if (!audio) {
        return res.status(400).json({ error: "Missing audio payload (base64 data required)" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const audioPart = {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audio,
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            audioPart,
            {
              text: "Transcribe this audio recording accurately and verbatim. If speech is in Bengali, transcribe in Bengali. If in English, transcribe in English. Provide clear punctuation and formatting.",
            },
          ],
        },
      });

      const transcription = response.text || "";
      return res.json({
        success: true,
        transcription: transcription.trim(),
      });
    } catch (error: any) {
      console.error("Transcription error:", error);
      return res.status(500).json({
        error: error?.message || "Failed to transcribe audio",
      });
    }
  });

  // WebSocket Server for Live Voice Conversations (gemini-3.1-flash-live-preview)
  const wss = new WebSocketServer({ server, path: "/ws/live" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("[Live API] Client connected to live voice session");

    if (!process.env.GEMINI_API_KEY) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          message: "GEMINI_API_KEY is not configured on the server.",
        })
      );
      clientWs.close();
      return;
    }

    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
          systemInstruction:
            "You are the senior editorial voice and live news intelligence assistant for Provat Barta, a prestigious bilingual newspaper. You converse warmly and intelligently with readers in English or Bengali. You discuss breaking news, global diplomacy, economics, culture, arts, and editorial dispatches with nuance, eloquence, and journalistic poise. Keep spoken answers concise, engaging, and conversational.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "audio", audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }
            if (message.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "session_closed" }));
            }
          },
          onerror: (err: any) => {
            console.error("[Live API] Session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  message: err?.message || "Live API session encountered an error",
                })
              );
            }
          },
        },
      });

      clientWs.on("message", (rawData) => {
        try {
          const payload = JSON.parse(rawData.toString());
          if (payload.type === "audio" && payload.audio) {
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (payload.type === "text" && payload.text) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          }
        } catch (e) {
          console.warn("[Live API] Failed to parse message:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("[Live API] Client disconnected, closing Gemini Live session");
        try {
          session.close();
        } catch {
          // ignore
        }
      });
    } catch (err: any) {
      console.error("[Live API] Failed to connect to Gemini Live:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            message: err?.message || "Failed to initialize Gemini Live API connection",
          })
        );
        clientWs.close();
      }
    }
  });

  // Vite middleware for development; static assets for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Provat Barta Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
