from fastapi import APIRouter
from app.api.v1.equipment.router import router as equipment_router
from app.api.v1.auth.router import router as auth_router
from app.api.v1.scheduling.router import router as scheduling_router
from app.api.v1.users.router import router as users_router
from app.api.v1.reports.router import router as reports_router

api_router = APIRouter()

# Include all module routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["user-management"])
api_router.include_router(equipment_router, prefix="/equipment", tags=["equipment"])
api_router.include_router(scheduling_router, prefix="/scheduling", tags=["scheduling"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])


# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}
