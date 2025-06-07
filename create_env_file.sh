#!/bin/bash

cat > frontend-codes/.env.local << 'EOL'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_WEBSOCKET=true

# Authentication
NEXT_PUBLIC_AUTH_COOKIE_NAME=access_token
EOL

echo ".env.local file created successfully." 