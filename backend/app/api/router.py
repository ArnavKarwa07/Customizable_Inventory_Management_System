from fastapi import APIRouter

from app.api.v1.audit import router as audit_router
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.health import router as health_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.orders import router as orders_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.products import router as products_router
from app.api.v1.suppliers import router as suppliers_router
from app.api.v1.users import router as users_router
from app.api.v1.warehouses import router as warehouses_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(organizations_router)
api_router.include_router(users_router)
api_router.include_router(warehouses_router)
api_router.include_router(products_router)
api_router.include_router(categories_router)
api_router.include_router(suppliers_router)
api_router.include_router(inventory_router)
api_router.include_router(orders_router)
api_router.include_router(audit_router)
