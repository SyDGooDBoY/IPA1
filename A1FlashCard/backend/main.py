from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FlashcardCreate(BaseModel):
    question: str
    answer: str

class FlashcardUpdate(BaseModel):
    question: str
    answer: str
    used: bool

# Temporary in-memory data
flashcards = [
    {
        "id": 1,
        "question": "What is React?",
        "answer": "A JavaScript library for building user interfaces.",
        "used": False
    },
    {
        "id": 2,
        "question": "What is FastAPI?",
        "answer": "A Python framework for building APIs.",
        "used": False
    }
]

next_id = 3

@app.get("/flashcards")
def get_flashcards():
    return flashcards

@app.post("/flashcards")
def create_flashcard(data: FlashcardCreate):
    global next_id
    new_card = {
        "id": next_id,
        "question": data.question,
        "answer": data.answer,
        "used": False
    }
    flashcards.append(new_card)
    next_id += 1
    return new_card

@app.put("/flashcards/{card_id}")
def update_flashcard(card_id: int, data: FlashcardUpdate):
    for card in flashcards:
        if card["id"] == card_id:
            card["question"] = data.question
            card["answer"] = data.answer
            card["used"] = data.used
            return card
    raise HTTPException(status_code=404, detail="Flashcard not found")

@app.delete("/flashcards/{card_id}")
def delete_flashcard(card_id: int):
    for index, card in enumerate(flashcards):
        if card["id"] == card_id:
            deleted = flashcards.pop(index)
            return {"message": "Deleted successfully", "card": deleted}
    raise HTTPException(status_code=404, detail="Flashcard not found")

@app.patch("/flashcards/{card_id}/use")
def mark_flashcard_used(card_id: int):
    for card in flashcards:
        if card["id"] == card_id:
            card["used"] = True
            return card
    raise HTTPException(status_code=404, detail="Flashcard not found")