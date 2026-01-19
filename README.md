# Claude Code Remote Skill HTTP Server

HTTP server that exposes the `shiller-pe-extractor` Claude Code skill as a web service.

## Project Structure

```
crawl-pe/
├── server.js                      # Main server entry point
├── package.json                   # Dependencies and scripts
├── .env                          # Environment configuration (DO NOT COMMIT)
├── .env.example                  # Environment template
├── src/
│   ├── config/
│   │   └── index.js              # Configuration management
│   ├── middleware/
│   │   ├── auth.js               # API Key authentication
│   │   └── validation.js         # Input validation
│   ├── routes/
│   │   ├── shiller-pe.js         # Skill data endpoint (REQUIRED)
│   │   └── execute.js            # Execution endpoints
│   └── services/
│       └── claude-executor.js    # Claude Code CLI wrapper
└── .claude/
    └── skills/
        └── shiller-pe-extractor/ # The skill that uses this server
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 2. Configure Environment

The `.env` file has been created with default values. You can modify it if needed:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
API_KEY=your-generated-api-key

# Claude Code Configuration
CLAUDE_TIMEOUT=60000
PROJECT_DIR=.
```

**Important**: Never commit the `.env` file to version control. It contains your API key.

### 3. Start the Server

```bash
npm start
```

Or for development:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "server": "running",
  "timestamp": "2026-01-19T10:00:00.000Z"
}
```

### Shiller PE Data Endpoint (Required by Skill)
```bash
POST /api/shiller-pe
Content-Type: application/json

{
  "pe": 40.3,
  "crawl_date": "2026-01-19"
}
```

Response:
```json
{
  "success": true,
  "message": "Data received and saved",
  "data": {
    "pe": 40.3,
    "crawl_date": "2026-01-19"
  }
}
```

### Execute Claude Code Command (Synchronous)
```bash
POST /api/v1/execute
X-API-Key: your-api-key
Content-Type: application/json

{
  "instruction": "extract Shiller PE data"
}
```

Response:
```json
{
  "success": true,
  "output": "...",
  "execution_time": 45000,
  "exit_code": 0
}
```

## Security Features

### API Key Authentication
All `/api/v1/*` endpoints require authentication via the `X-API-Key` header.

### Input Validation
- Maximum instruction length: 5000 characters
- Blocks dangerous patterns: `&& rm`, `; rm`, `| rm`, backticks, `$()`
- Uses `spawn()` with args array to prevent command injection

### Process Isolation
- Each execution runs in its own process
- Timeout enforcement (default: 60 seconds)
- Error message sanitization

## Testing

### 1. Test Health Check
```bash
curl http://localhost:3000/health
```

### 2. Test Shiller PE Endpoint
```bash
curl -X POST http://localhost:3000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 40.3, "crawl_date": "2026-01-19"}'
```

### 3. Test Skill Execution
First, get your API key from `.env`:
```bash
cat .env | grep API_KEY
```

Then execute:
```bash
curl -X POST http://localhost:3000/api/v1/execute \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"instruction": "extract Shiller PE data"}'
```

### 4. Test with Claude Code CLI
```bash
claude -p "extract Shiller PE data"
```

Then verify the data was saved:
```bash
cat shillerpe.json
```

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Check for errors in the console output

### Authentication fails
- Verify the `X-API-Key` header is set correctly
- Check the API key in `.env` matches your request

### Claude Code execution fails
- Ensure Claude CLI is installed and in PATH: `claude --version`
- Check the `PROJECT_DIR` in `.env` is correct
- Verify the skill is properly configured

### Skill can't push data
- Ensure the server is running on port 3000
- Check the skill configuration points to `http://localhost:3000/api/shiller-pe`
- Verify no firewall is blocking the connection

## Development Notes

### Adding New Endpoints
1. Create a new route file in `src/routes/`
2. Import and use middleware as needed
3. Mount the route in `server.js`

### Modifying Security Rules
- Update validation patterns in `src/middleware/validation.js`
- Adjust timeout in `.env` (`CLAUDE_TIMEOUT`)

### Error Handling
All errors are caught and sanitized. In development mode, full error messages are returned. In production, only generic messages are shown.

## Next Steps

- [ ] Install dependencies with `npm install`
- [ ] Start the server with `npm start`
- [ ] Test the health endpoint
- [ ] Test the Shiller PE endpoint
- [ ] Run the skill and verify data is saved
- [ ] (Optional) Implement async task management
- [ ] (Optional) Set up FRP for remote access

## License

ISC
