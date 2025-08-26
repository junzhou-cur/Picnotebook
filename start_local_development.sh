#!/bin/bash

# Local Development Startup Script
# This script starts both the mock API and frontend on localhost

echo "🚀 Starting PicNotebook Local Development Environment"
echo "=================================================="

# Kill any existing processes on these ports
echo "Cleaning up existing processes..."
pkill -f "python.*mock_experiment_api.py" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Start the mock experiment API
echo "Starting Mock Experiment API on http://127.0.0.1:5005"
cd /Users/zhoujun/Desktop/Claude/picnotebook
python mock_experiment_api.py &
API_PID=$!

# Wait for API to start
sleep 3

# Start the frontend
echo "Starting Frontend on http://127.0.0.1:3002"
cd /Users/zhoujun/Desktop/Claude/picnotebook/frontend
npm run dev -- -p 3002 &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo "📊 Frontend: http://127.0.0.1:3002"
echo "🔧 API: http://127.0.0.1:5005"
echo "💾 API Health: http://127.0.0.1:5005/health"
echo "📋 Review Page: http://127.0.0.1:3002/review"
echo ""
echo "To stop the development environment, run:"
echo "  kill $API_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to handle cleanup on script termination
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    kill $API_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait