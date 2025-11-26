#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient, Client } from "@libsql/client";

const server = new Server(
  {
    name: "@prama13/turso-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Validate environment variables
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("Error: TURSO_DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!authToken) {
  console.error("Error: TURSO_AUTH_TOKEN environment variable is required");
  process.exit(1);
}

// Create Turso client
const client: Client = createClient({
  url: databaseUrl,
  authToken: authToken,
});

// Create resource base URL
const resourceBaseUrl = new URL(databaseUrl);
resourceBaseUrl.protocol = "turso:";
resourceBaseUrl.password = "";

const SCHEMA_PATH = "schema";

// Dangerous SQL keywords that indicate write operations
const WRITE_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "CREATE",
  "ALTER",
  "REPLACE",
  "TRUNCATE",
  "ATTACH",
  "DETACH",
  "PRAGMA",
  "REINDEX",
  "VACUUM",
  "ANALYZE",
];

/**
 * Check if SQL query contains write operations
 */
function isReadOnlyQuery(sql: string): boolean {
  const upperSql = sql.toUpperCase().trim();
  
  // Check for dangerous keywords
  for (const keyword of WRITE_KEYWORDS) {
    // Use word boundary regex to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(upperSql)) {
      return false;
    }
  }
  
  return true;
}

// List all tables as resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );

    return {
      resources: result.rows.map((row) => ({
        uri: new URL(
          `${row.name}/${SCHEMA_PATH}`,
          resourceBaseUrl
        ).href,
        mimeType: "application/json",
        name: `"${row.name}" table schema`,
      })),
    };
  } catch (error) {
    console.error("Error listing tables:", error);
    throw error;
  }
});

// Read table schema
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const resourceUrl = new URL(request.params.uri);
    const pathComponents = resourceUrl.pathname.split("/");
    const schema = pathComponents.pop();
    const tableName = pathComponents.pop();

    if (schema !== SCHEMA_PATH) {
      throw new Error("Invalid resource URI");
    }

    if (!tableName) {
      throw new Error("Table name is required");
    }

    // Use PRAGMA table_info to get column information
    const result = await client.execute(`PRAGMA table_info(${tableName})`);

    // Format the result to match information_schema style
    const columns = result.rows.map((row) => ({
      column_name: row.name,
      data_type: row.type,
      is_nullable: row.notnull === 0 ? "YES" : "NO",
      column_default: row.dflt_value,
      is_primary_key: row.pk === 1,
    }));

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(columns, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error("Error reading table schema:", error);
    throw error;
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "query",
        description:
          "Run a read-only SQL query against the Turso database. Only SELECT statements are allowed.",
        inputSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
              description: "The SQL query to execute (SELECT statements only)",
            },
          },
          required: ["sql"],
        },
      },
    ],
  };
});

// Execute query tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "query") {
    const sql = request.params.arguments?.sql as string;

    if (!sql) {
      throw new Error("SQL query is required");
    }

    // Validate read-only query
    if (!isReadOnlyQuery(sql)) {
      throw new Error(
        "Only read-only SELECT queries are allowed. Write operations (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, etc.) are not permitted."
      );
    }

    try {
      const result = await client.execute(sql);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.rows, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Query execution failed: ${errorMessage}`);
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Turso MCP server running on stdio");
}

runServer().catch(console.error);