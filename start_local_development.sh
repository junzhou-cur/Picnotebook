#!/bin/bash

# Local Development Startup Script with Auto-Configuration
# This script starts the mock API, frontend, and configuration watcher

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting PicNotebook Local Development Environment"
echo "=================================================="
echo "📁 Working directory: $SCRIPT_DIR"

# Check if enhanced startup is available
if [ -f "config-watcher.js" ] && command -v node &> /dev/null; then
    echo "✨ Auto-Configuration Watcher: ENABLED"
    echo "   - Monitors for port conflicts every 5 seconds"  
    echo "   - Automatically fixes configuration issues"
    echo "   - No more 'Failed to fetch' errors!"
    USE_WATCHER=true
else
    echo "⚠️  Auto-Configuration Watcher: DISABLED"
    echo "   - Install Node.js to enable automatic configuration monitoring"
    echo "   - Or run: ./start_with_watcher.sh for full features"
    USE_WATCHER=false
fi

# Kill any existing processes on these ports
echo ""
echo "Cleaning up existing processes..."
pkill -f "python.*mock_experiment_api.py" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
pkill -f "node.*config-watcher.js" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Start the configuration watcher first (if available)
if [ "$USE_WATCHER" = true ]; then
    echo "🔍 Starting Auto-Configuration Watcher..."
    cd "$SCRIPT_DIR"
    node config-watcher.js &
    WATCHER_PID=$!
    echo "   Watcher started (PID: $WATCHER_PID)"
    sleep 1
fi

# Start the mock experiment API
echo "📡 Starting Mock Experiment API on http://127.0.0.1:5005"
cd "$SCRIPT_DIR"
python mock_experiment_api.py &
API_PID=$!

# Wait for API to start
sleep 3

# Start the frontend
echo "🌐 Starting Frontend on http://127.0.0.1:3002"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002 | grep -q "200"; then
        echo "✅ Frontend is ready!"
        break
    fi
    sleep 1
done

echo ""
echo "✅ Development environment started!"

# Open browser automatically
echo "🌐 Opening browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://127.0.0.1:3002
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open http://127.0.0.1:3002
    elif command -v gnome-open &> /dev/null; then
        gnome-open http://127.0.0.1:3002
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start http://127.0.0.1:3002
fi

if [ "$USE_WATCHER" = true ]; then
    echo "🔍 Auto-Configuration Watcher: ACTIVE (PID: $WATCHER_PID)"
    echo "   - Monitoring for port conflicts and auto-fixing issues"
    echo "   - Logs: config-watcher.log"
fi

echo "📊 Frontend: http://127.0.0.1:3002"
echo "🔧 API: http://127.0.0.1:5005"
echo "💾 API Health: http://127.0.0.1:5005/health"
echo "📋 Review Page: http://127.0.0.1:3002/review"

if [ "$USE_WATCHER" = true ]; then
    echo ""
    echo "💡 Smart Features Active:"
    echo "   ✨ Automatic port conflict resolution"
    echo "   🔧 Self-healing configuration"
    echo "   🚫 No more 'Failed to fetch' errors"
fi

echo ""
echo "🛑 To stop all services:"
if [ "$USE_WATCHER" = true ]; then
    echo "  kill $API_PID $FRONTEND_PID $WATCHER_PID"
else
    echo "  kill $API_PID $FRONTEND_PID"
fi
echo ""
echo "Press Ctrl+C to stop all services"

# Function to handle cleanup on script termination
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    
    if [ "$USE_WATCHER" = true ]; then
        echo "   Stopping configuration watcher..."
        kill $WATCHER_PID 2>/dev/null || true
    fi
    
    echo "   Stopping API and frontend..."
    kill $API_PID $FRONTEND_PID 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait