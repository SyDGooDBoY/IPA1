import { useEffect, useState } from "react";
import "./FlashcardApp.css";

function FlashcardApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Backend service entry for all flashcard API calls.
  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`${API_BASE}/flashcards`);
      const data = await response.json();

      // Keep UI-only state inside each card object (not persisted in backend).
      const cardsWithUIState = data.map((card) => ({
        ...card,
        showAnswer: false,
      }));

      setFlashcards(cardsWithUIState);
    } catch (error) {
      console.error("Failed to fetch flashcards:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) return;

    try {
      // If editingId exists, update that card; otherwise create a new one.
      if (editingId !== null) {
        const cardToUpdate = flashcards.find((card) => card.id === editingId);

        await fetch(`${API_BASE}/flashcards/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            answer: answer.trim(),
            used: cardToUpdate.used,
          }),
        });

        setEditingId(null);
      } else {
        await fetch(`${API_BASE}/flashcards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            answer: answer.trim(),
          }),
        });
      }

      setQuestion("");
      setAnswer("");
      fetchFlashcards();
    } catch (error) {
      console.error("Failed to save flashcard:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/flashcards/${id}`, {
        method: "DELETE",
      });
      fetchFlashcards();
    } catch (error) {
      console.error("Failed to delete flashcard:", error);
    }
  };

  const handleEdit = (card) => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditingId(card.id);
  };

  const handleReveal = (id) => {
    // Toggle answer visibility for a single clicked card.
    const updatedCards = flashcards.map((card) =>
      card.id === id ? { ...card, showAnswer: !card.showAnswer } : card
    );
    setFlashcards(updatedCards);
  };

  const handleUseCard = async (id) => {
    try {
      await fetch(`${API_BASE}/flashcards/${id}/use`, {
        method: "PATCH",
      });
      fetchFlashcards();
    } catch (error) {
      console.error("Failed to mark flashcard as used:", error);
    }
  };

  // Show only cards that are still in active study queue.
  const activeCards = flashcards.filter((card) => !card.used);

  return (
    <div className="app">
      <div className="container">
        <h1>Flashcard Learning App</h1>
        <p className="subtitle">Create, review, edit and remove your flashcards.</p>

        <form className="flashcard-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            placeholder="Enter answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button type="submit">
            {editingId !== null ? "Update Flashcard" : "Add Flashcard"}
          </button>
        </form>

        <div className="cards-section">
          <h2>Study Cards</h2>

          {activeCards.length === 0 ? (
            <p className="empty-message">No flashcards available.</p>
          ) : (
            <div className="card-grid">
              {activeCards.map((card) => (
                <div key={card.id} className="flashcard">
                  <div
                    className="flashcard-content"
                    onClick={() => handleReveal(card.id)}
                  >
                    <h3>{card.question}</h3>
                    {card.showAnswer && <p>{card.answer}</p>}
                  </div>

                  <div className="card-actions">
                    <button onClick={() => handleEdit(card)}>Edit</button>
                    <button onClick={() => handleDelete(card.id)}>Delete</button>
                    <button onClick={() => handleUseCard(card.id)}>Used</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlashcardApp;