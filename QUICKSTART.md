# Quick Start Guide

## What Was Built

A complete HTTP server for the Claude Code `shiller-pe-extractor` skill with:

✅ Express.js server on port 3000
✅ API Key authentication
✅ Input validation and security
✅ Shiller PE data endpoint (required by skill)
✅ Claude Code CLI execution endpoint
✅ Health check endpoint
✅ All dependencies installed
✅ Server tested and working

## Your API Key

```
sk_dev_7a3ea8206961159bb232fd6647d86a1678d728cd475a479788f3c6e72e5f967a
```

**Important**: This key is stored in `.env` and should never be committed to version control.

## Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Test the Server

### 1. Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"healthy","server":"running","timestamp":"..."}
```

### 2. Test Shiller PE Endpoint (Required by Skill)
```bash
curl -X POST http://localhost:3000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 40.3, "crawl_date": "2026-01-19"}'
```

Expected response:
```json
{"success":true,"message":"Data received and saved","data":{...}}
```

Verify data was saved:
```bash
cat shillerpe.json
```

### 3. Test Execute Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/execute \
  -H "X-API-Key: sk_dev_7a3ea8206961159bb232fd6647d86a1678d728cd475a479788f3c6e72e5f967a" \
  -H "Content-Type: application/json" \
  -d '{"instruction": "extract Shiller PE data"}'
```

**Note**: This requires the `claude` CLI to be installed and in your PATH.

## Use with Claude Code Skill

Once the server is running, you can use the skill:

```bash
claude -p "extract Shiller PE data"
```

The skill will:
1. Extract Shiller PE data from the web
2. POST the data to `http://localhost:3000/api/shiller-pe`
3. The server saves it to `shillerpe.json`

## Project Structure

```
crawl-pe/
├── server.js                      # Main server
├── package.json                   # Dependencies
├── .env                          # Configuration (API key)
├── src/
│   ├── config/index.js           # Config loader
│   ├── middleware/
│   │   ├── auth.js               # API authentication
│   │   └── validation.js         # Input validation
│   ├── routes/
│   │   ├── shiller-pe.js         # Skill data endpoint
│   │   └── execute.js            # Execution endpoint
│   └── services/
│       └── claude-executor.js    # CLI wrapper
└── shillerpe.json                # Output data file
```

## Security Features

✅ API Key authentication on `/api/v1/*` endpoints
✅ Input validation (max 5000 chars)
✅ Dangerous pattern blocking (`&& rm`, `; rm`, etc.)
✅ Process timeout (60 seconds)
✅ Command injection prevention

## Next Steps

1. **Test the skill**: Run `claude -p "extract Shiller PE data"` with the server running
2. **Remote access** (optional): Set up FRP to expose the server remotely
3. **Async support** (optional): Implement task queue for long-running operations
4. **Monitoring** (optional): Add logging and monitoring

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Server won't start
- Check Node.js is installed: `node --version`
- Check dependencies are installed: `ls node_modules`
- Check for errors in console output

### Skill can't connect
- Ensure server is running: `curl http://localhost:3000/health`
- Check firewall isn't blocking port 3000
- Verify skill configuration points to correct URL

## Documentation

See `README.md` for complete documentation including:
- Detailed API reference
- Security features
- Development notes
- Full troubleshooting guide
