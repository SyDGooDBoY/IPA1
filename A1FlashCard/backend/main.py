from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import engine, create_db_and_tables
from models import Flashcard, FlashcardCreate, FlashcardUpdate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {"message": "Flashcard API is running with MySQL"}


@app.get("/flashcards")
def get_flashcards():
    with Session(engine) as session:
        statement = select(Flashcard)
        flashcards = session.exec(statement).all()
        return flashcards


@app.post("/flashcards")
def create_flashcard(data: FlashcardCreate):
    with Session(engine) as session:
        new_card = Flashcard(question=data.question, answer=data.answer, used=False)
        session.add(new_card)
        session.commit()
        session.refresh(new_card)
        return new_card


@app.put("/flashcards/{card_id}")
def update_flashcard(card_id: int, data: FlashcardUpdate):
    with Session(engine) as session:
        card = session.get(Flashcard, card_id)

        if not card:
            raise HTTPException(status_code=404, detail="Flashcard not found")

        card.question = data.question
        card.answer = data.answer
        card.used = data.used

        session.add(card)
        session.commit()
        session.refresh(card)
        return card


@app.delete("/flashcards/{card_id}")
def delete_flashcard(card_id: int):
    with Session(engine) as session:
        card = session.get(Flashcard, card_id)

        if not card:
            raise HTTPException(status_code=404, detail="Flashcard not found")

        session.delete(card)
        session.commit()
        return {"message": "Deleted successfully"}


@app.patch("/flashcards/{card_id}/use")
def mark_flashcard_used(card_id: int):
    with Session(engine) as session:
        card = session.get(Flashcard, card_id)

        if not card:
            raise HTTPException(status_code=404, detail="Flashcard not found")

        card.used = True
        session.add(card)
        session.commit()
        session.refresh(card)
        return card
