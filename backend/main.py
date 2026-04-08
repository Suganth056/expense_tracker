from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.auth import auth_router


app = FastAPI(title="Expense Tracker API System")

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allowed frontend URLs
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, PUT, DELETE etc.
    allow_headers=["*"],          # allow all headers
)

app.include_router(auth_router,prefix='/auth')

@app.get("/")
def root(request):
    return {"message": "API is running"}