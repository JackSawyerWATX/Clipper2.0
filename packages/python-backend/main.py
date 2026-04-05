"""
Clipper 2.0 FastAPI Backend Server
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Import routes and config
from config import test_connection
from routes import customers_router

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("=" * 50)
    print("🚀 Starting Clipper 2.0 FastAPI Server...")
    test_connection()
    print(f"📊 API documentation: http://localhost:{os.getenv('PORT', 5000)}/docs")
    print(f"🔧 Interactive API: http://localhost:{os.getenv('PORT', 5000)}/redoc")
    print("=" * 50)
    yield
    # Shutdown (if needed)
    print("👋 Shutting down Clipper 2.0 FastAPI Server...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Clipper 2.0 API",
    description="Inventory and Order Management System API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(customers_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Clipper 2.0 API",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
