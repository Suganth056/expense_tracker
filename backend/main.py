from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.auth import auth_router
from endpoints.income_router import income_router


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
app.include_router(income_router,prefix="/income")


@app.get("/")
def root(request):
    return {"message": "API is running"}