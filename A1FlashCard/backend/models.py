from typing import Optional
from sqlmodel import SQLModel, Field


class Flashcard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question: str
    answer: str
    used: bool = False


class FlashcardCreate(SQLModel):
    question: str
    answer: str


class FlashcardUpdate(SQLModel):
    question: str
    answer: str
    used: bool
