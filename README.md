# @prama13/turso-mcp

A Model Context Protocol (MCP) server for readonly querying of Turso/libSQL databases. This server enables AI assistants like Claude, Roo, and Cline to safely query your Turso database without any risk of data modification.

## Features

- 🔒 **Read-only operations** - Only SELECT queries are allowed
- 📊 **Table browsing** - List all tables and view their schemas
- 🚫 **Security-focused** - Blocks all write operations (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, etc.)
- 🔌 **MCP Protocol** - Compatible with any MCP client
- 📦 **Easy setup** - Works with `npx` - no installation required

## Installation

No installation needed! Use directly with `npx`:

```bash
npx @prama13/turso-mcp
```

## Configuration

### For Roo/Cline

Add to your MCP settings:

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

### For Claude Desktop

Add to `claude_desktop_config.json`:

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

## Getting Your Turso Credentials

1. Install Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Sign up/login:
```bash
turso auth signup
# or
turso auth login
```

3. Create a database:
```bash
turso db create my-database
```

4. Get your database URL:
```bash
turso db show my-database --url
```

5. Create an auth token:
```bash
turso db tokens create my-database
```

## Available Tools

### query
Run read-only SQL queries against your Turso database.

**Parameters:**
- `sql` (string, required) - The SQL query to execute (SELECT only)

**Example:**
```sql
SELECT * FROM users WHERE id = 1;
```

## Available Resources

The server exposes all database tables as resources:

- **List tables** - Automatically discovers all tables in your database
- **Table schemas** - View column definitions for each table

## Security

This server implements multiple layers of security to ensure read-only access:

1. **Keyword filtering** - Blocks SQL statements containing write keywords:
   - INSERT, UPDATE, DELETE, DROP, CREATE, ALTER
   - REPLACE, TRUNCATE, ATTACH, DETACH
   - PRAGMA, REINDEX, VACUUM, ANALYZE

2. **Environment-based credentials** - Database credentials are passed via environment variables, never in code

## Development

```bash
# Clone the repository
git clone https://github.com/PramaAditya/turso-mcp.git
cd turso-mcp

# Install dependencies
npm install

# Build
npm run build

# Test locally
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node dist/index.js
```

## License

MIT

## Author

prama13

## Related

- [Turso](https://turso.tech) - Edge SQLite database
- [Model Context Protocol](https://modelcontextprotocol.io) - Open protocol for AI-application integration
- [libSQL](https://github.com/tursodatabase/libsql) - Open source fork of SQLite