#!/usr/bin/env python3
"""
Bitcorp ERP Backend Test & Start Script
"""
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from app.core.init_db import initialize_database
    import uvicorn
    
    def main():
        print("🚀 Starting Bitcorp ERP Backend...")
        print("=" * 50)
        
        # Test database connection and initialize
        try:
            print("📚 Initializing database...")
            initialize_database()
            print("✅ Database initialized successfully!")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            print("🔄 Continuing anyway (database might already be initialized)")
        
        print("\n🌐 Starting API server...")
        print("📍 API Documentation: http://localhost:8000/docs")
        print("📍 Health Check: http://localhost:8000/health")
        print("📍 API Root: http://localhost:8000/api/v1")
        
        # Start the server
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )

    if __name__ == "__main__":
        main()
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you're in the backend directory and dependencies are installed:")
    print("   cd backend")
    print("   pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
