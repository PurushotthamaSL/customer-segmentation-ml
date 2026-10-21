from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, dataset, clustering, customers, insights
from app.dependencies import data_service, ml_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure data is ready and default K-Means model is trained on startup."""
    print("[CustomerLens AI] Initializing server...")
    if data_service.is_dataset_available():
        try:
            if ml_service.metadata is None:
                print("[CustomerLens AI] Training initial K-Means model on Mall Customers dataset...")
                ml_service.train_kmeans()
                print("[CustomerLens AI] Model trained successfully!")
            else:
                print("[CustomerLens AI] Loaded existing fitted model from disk.")
        except Exception as e:
            print(f"[CustomerLens AI] Startup training notice: {e}")
    else:
        print("[CustomerLens AI] Notice: Mall_Customers.csv not found yet. Ready for download/upload.")
    yield

app = FastAPI(
    title="CustomerLens AI — API",
    description=(
        "Production-grade backend for CustomerLens AI Customer Segmentation & Intelligent Analytics. "
        "Powered by FastAPI, Scikit-learn K-Means clustering, Pandas, and transparent business intelligence logic."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(dataset.router)
app.include_router(clustering.router)
app.include_router(customers.router)
app.include_router(insights.router)


@app.get("/")
def root():
    return {
        "project": "CustomerLens AI",
        "description": "Customer Segmentation & Intelligent Analytics Platform",
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
