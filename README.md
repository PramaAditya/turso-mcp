<p align="center">
  <img src="https://raw.githubusercontent.com/tursodatabase/brand-assets/main/turso-logos/turso-logo-dark.png" width="120" alt="Turso Logo">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@prama13/turso-mcp"><img src="https://img.shields.io/npm/v/@prama13/turso-mcp.svg?style=flat-square&color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@prama13/turso-mcp"><img src="https://img.shields.io/npm/dm/@prama13/turso-mcp.svg?style=flat-square&color=green" alt="downloads"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/mcp-protocol-orange.svg?style=flat-square" alt="mcp protocol"></a>
  <a href="https://github.com/PramaAditya/turso-mcp/blob/main/LICENSE"><img src="https://img.shields.io/github/license/PramaAditya/turso-mcp.svg?style=flat-square" alt="license"></a>
</p>

# @prama13/turso-mcp

<p align="center">
  <b>Safe, read-only Turso/libSQL database access for AI assistants.</b>
  <br>
  An elegant Model Context Protocol (MCP) server that empowers Claude, Roo, and Cline to list schemas and run SELECT queries securely.
</p>

---

```sql
-- AI Assistant: "Let's explore the users table and query some data."

┌── [turso-mcp] Discovered Resources ─────────────────────────────────────┐
│  • turso://your-database.turso.io/users/schema                         │
│  • turso://your-database.turso.io/products/schema                      │
└────────────────────────────────────────────────────────────────────────┘

AI Assistant: Calling tool [query] with SQL: "SELECT name, email FROM users LIMIT 3"

┌── [turso-mcp] Query Result ─────────────────────────────────────────────┐
│  ┌──────────────────────┬────────────────────────────────────────────┐  │
│  │ name                 │ email                                      │  │
│  ├──────────────────────┼────────────────────────────────────────────┤  │
│  │ Alice Smith          │ alice@example.com                          │  │
│  │ Bob Jones            │ bob@example.com                            │  │
│  │ Charlie Brown        │ charlie@example.com                        │  │
│  └──────────────────────┴────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

AI Assistant: Calling tool [query] with SQL: "DELETE FROM users WHERE id = 1"

┌── [turso-mcp] Security Block ───────────────────────────────────────────┐
│  Error: Write operations are strictly blocked for security.             │
│  Blocked Keyword: DELETE                                                │
└────────────────────────────────────────────────────────────────────────┘
```

<br>

## AI-Safe Database Access by Design

Unlike standard database integrations that grant unrestricted write access, `@prama13/turso-mcp` is designed from the ground up for non-destructive inspection.

| Capability | Generic SQL MCP | @prama13/turso-mcp |
| :--- | :---: | :---: |
| Run SELECT queries | ✅ Yes | ✅ Yes |
| Table schema auto-discovery | ❌ No | ✅ Yes (as Resources) |
| Prevent accidental `DELETE` | ❌ No | ✅ Yes (Blocked) |
| Prevent schema `DROP` / `ALTER` | ❌ No | ✅ Yes (Blocked) |

<br>

## Minimum Viable Knowledge

✓ **Zero Install**: Run instantly with `npx @prama13/turso-mcp` – no local installation required.
✓ **Read-Only Enforced**: Any SQL containing forbidden keywords (e.g., `INSERT`, `UPDATE`, `DROP`) is immediately rejected before hitting Turso.
✓ **Auto-Discovering**: All user-defined tables are automatically registered as MCP resources.

<br>

## Quick Start

### 1. Configuration

Add the following block to your MCP client configuration (e.g., `claude_desktop_config.json` or Roo/Cline settings):

```json
{
  "mcpServers": {
    "turso": {
      "command": "npx",
      "args": ["-y", "@prama13/turso-mcp"],
      "env": {
        "TURSO_DATABASE_URL": "libsql://your-database.turso.io",
        "TURSO_AUTH_TOKEN": "your-auth-token"
      }
    }
  }
}
```

### 2. Available Integration Touchpoints

*   **Tool: `query`** – Run read-only SQLite/libSQL queries (e.g., `SELECT * FROM products LIMIT 5`).
*   **Resource: `<table_name>/schema`** – Inspect structured columns, primary keys, and types of database tables automatically.

<br>

## Project Architecture

```
           ┌────────────────────────┐
           │ AI Client (e.g Claude) │
           └───────────┬────────────┘
                       │ MCP Protocol
                       ▼
           ┌────────────────────────┐
           │ @prama13/turso-mcp     │
           │  ├─ Schema Discovered  │
           │  └─ SQL Parser Guard   │
           └───────────┬────────────┘
                       │ Only Safe SELECT
                       ▼
           ┌────────────────────────┐
           │ Turso Edge Database    │
           └────────────────────────┘
```

<br>

## Local Development

```bash
git clone https://github.com/PramaAditya/turso-mcp.git
cd turso-mcp
npm install
npm run build
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node dist/index.js
```

---

<p align="center">
  <a href="https://turso.tech">Turso</a> · <a href="https://modelcontextprotocol.io">Model Context Protocol</a> · <a href="https://github.com/tursodatabase/libsql">libSQL</a>
</p>

<p align="center">
  <sub>Released under the MIT License. Created by PramaAditya.</sub>
</p>