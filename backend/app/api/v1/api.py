from fastapi import APIRouter
from app.api.v1.equipment.router import router as equipment_router
from app.api.v1.auth.router import router as auth_router

api_router = APIRouter()

# Include all module routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(equipment_router, prefix="/equipment", tags=["equipment"])


# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}
