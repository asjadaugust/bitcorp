"""
Temporary CORS fix for Windows development
This file patches the FastAPI app to allow all CORS origins
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def apply_windows_cors_fix(app: FastAPI):
    """Apply Windows-compatible CORS settings"""
    
    # Add permissive CORS middleware for Windows development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for development
        allow_credentials=True,
        allow_methods=["*"],  # Allow all methods
        allow_headers=["*"],  # Allow all headers
        expose_headers=["*"],
    )
    
    print("✅ Windows CORS fix applied!")
    return app
