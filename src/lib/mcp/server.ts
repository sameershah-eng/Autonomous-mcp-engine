import type { MCPTool, MCPResource, ToolCallResult } from '../../types/mcp';
import { mcpTools } from './tools';
import { mcpResources } from './resources';

export class SimulatedMCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private enabledToolNames: Set<string> = new Set();

  constructor() {
    for (const tool of mcpTools) {
      this.tools.set(tool.name, tool);
      this.enabledToolNames.add(tool.name);
    }
    for (const res of mcpResources) {
      this.resources.set(res.uri, res);
    }
  }

  public setEnabledTools(allowedNames: string[]): void {
    this.enabledToolNames = new Set(allowedNames);
  }

  public async listTools(): Promise<MCPTool[]> {
    return Array.from(this.tools.values()).filter((t) => this.enabledToolNames.has(t.name));
  }

  public getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  public async callTool(name: string, args: Record<string, unknown>): Promise<ToolCallResult> {
    const startTime = performance.now();
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        success: false,
        error: `MCP Tool "${name}" is not registered on this server.`,
        durationMs: Math.round(performance.now() - startTime),
      };
    }

    if (!this.enabledToolNames.has(name)) {
      return {
        success: false,
        error: `MCP Tool "${name}" has been disabled by integration permissions policy.`,
        durationMs: Math.round(performance.now() - startTime),
      };
    }

    try {
      const data = await tool.handler(args);
      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        data,
        durationMs,
      };
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs,
      };
    }
  }

  public async listResources(): Promise<MCPResource[]> {
    return Array.from(this.resources.values());
  }

  public async readResource(uri: string): Promise<MCPResource> {
    const res = this.resources.get(uri);
    if (!res) {
      throw new Error(`Resource with URI "${uri}" was not found.`);
    }
    return res;
  }
}

export const mcpServer = new SimulatedMCPServer();
