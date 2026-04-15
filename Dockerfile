FROM node:20-slim

WORKDIR /app

# Install the MCP server globally
RUN npm install -g @hauntapi/mcp-server

# The API key is passed at runtime via environment variable
ENV HAUNT_API_KEY=""

ENTRYPOINT ["npx", "-y", "@hauntapi/mcp-server"]
