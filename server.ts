import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI if key is present
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check & key detection
app.get('/api/status', (req, res) => {
  const ai = getGeminiClient();
  res.json({
    status: 'ok',
    hasKey: Boolean(ai),
    activeModel: 'gemini-3.8-flash',
  });
});

// 2. Chat with Tools / Function Calling
app.post('/api/llm/chat', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please switch to Demo Mode in Settings.',
      });
    }

    const { messages, tools, systemPrompt, temperature, model, structuredOutputSchema } = req.body;

    // Convert MCP tools to Gemini function declarations
    const functionDeclarations = tools?.map((tool: any) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: Type.OBJECT,
        properties: tool.inputSchema?.properties || {},
        required: tool.inputSchema?.required || [],
      },
    }));

    // Convert messages to Gemini contents format
    // Map user, assistant, and tool messages
    const contents: any[] = [];
    for (const msg of messages) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.role === 'assistant') {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.args,
              },
            });
          }
        }
        contents.push({ role: 'model', parts });
      } else if (msg.role === 'tool') {
        let responseData: any = {};
        try {
          responseData = JSON.parse(msg.content);
        } catch {
          responseData = { output: msg.content };
        }
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: msg.name || 'tool_response',
                response: responseData,
              },
            },
          ],
        });
      }
    }

    const config: any = {};
    if (systemPrompt) {
      config.systemInstruction = systemPrompt;
    }
    if (typeof temperature === 'number') {
      config.temperature = temperature;
    }
    if (functionDeclarations && functionDeclarations.length > 0) {
      config.tools = [{ functionDeclarations }];
    }
    if (structuredOutputSchema) {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
      config,
    });

    const parsedCalls = response.functionCalls?.map((fc, idx) => ({
      id: `call_${Date.now()}_${idx}`,
      name: fc.name,
      args: fc.args as Record<string, unknown>,
    }));

    return res.json({
      content: response.text || '',
      toolCalls: parsedCalls && parsedCalls.length > 0 ? parsedCalls : undefined,
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount || 0,
            completionTokens: response.usageMetadata.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Gemini API call failed',
    });
  }
});

// 3. Embeddings for RAG
app.post('/api/llm/embed', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const result = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text,
    });

    const embeddingValues = (result as any).embeddings?.[0]?.values || (result as any).embedding?.values || [];
    return res.json({ embedding: embeddingValues });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Embedding generation failed',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Relay server active on port ${PORT}`);
  });
}

startServer();
