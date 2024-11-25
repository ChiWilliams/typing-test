from typing import Annotated
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import re

from sqlmodel import SQLModel, Field, Session, create_engine, select

class LeaderboardEntry(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    time: int

sqlite_file_name = "highscores.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0/8000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get_high_scores")
async def get_high_score(
    session: SessionDep
) -> list[LeaderboardEntry]:
    # fetch from db
    #rewrite as query for top ten times, sorted

    entries = session.exec(select(LeaderboardEntry).order_by(LeaderboardEntry.time)).all()
    return entries

@app.put("/set_new_score", status_code=204)
async def set_new_score(score: LeaderboardEntry) -> None:
    print(score)

    #check if there is a name (we already know it's a string)
    if not score.name:
        raise HTTPException(status_code=400, detail = "Name cannot be empty")
    #sanitize the input
    name = re.sub(r"[^a-zA-Z0-9]", "", score.name)
    #check that the length of the sanitized name is correct:
    if not 2 <= len(name) <= 15:
        raise HTTPException(status_code=400, detail="Name must be between 2 and 10 characters")
    #Check that the time is positive
    if 0 >= score.time:
        raise HTTPException(status_code=400, detail="Time must be positive")
    
    #add element and commit
    with Session(engine) as session:
        session.add(LeaderboardEntry(name=name, time=score.time))
        session.commit()

# @app.delete("/admin/reset_scores", status_code=204)
# async def reset_scores() -> None:
#     #rewrite as SQL clear the table
#     # clear db
#     pass

import uvicorn
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True) 