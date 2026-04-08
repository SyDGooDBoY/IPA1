import { useEffect, useRef, useState } from "react";
import "./FlashcardApp.css";

function FlashcardApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [shouldScrollToLatest, setShouldScrollToLatest] = useState(false);
  const [latestCardId, setLatestCardId] = useState(null);
  const [showUsedCards, setShowUsedCards] = useState(false);

  const API_BASE = "http://127.0.0.1:8000";
  const cardsContainerRef = useRef(null);
  const usedCardsContainerRef = useRef(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    if (shouldScrollToLatest && cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({
        left: cardsContainerRef.current.scrollWidth,
        behavior: "smooth",
      });

      setShouldScrollToLatest(false);

      const timer = setTimeout(() => {
        setLatestCardId(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flashcards, shouldScrollToLatest]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`${API_BASE}/flashcards`);
      const data = await response.json();

      const cardsWithUIState = data.map((card) => {
        const existingCard = flashcards.find((item) => item.id === card.id);
        return {
          ...card,
          showAnswer: existingCard ? existingCard.showAnswer : false,
        };
      });

      setFlashcards(cardsWithUIState);
    } catch (error) {
      console.error("Failed to fetch flashcards:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) return;

    try {
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
        setQuestion("");
        setAnswer("");
        fetchFlashcards();
      } else {
        const response = await fetch(`${API_BASE}/flashcards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            answer: answer.trim(),
          }),
        });

        const newCard = await response.json();

        setLatestCardId(newCard.id);
        setShouldScrollToLatest(true);
        setQuestion("");
        setAnswer("");
        fetchFlashcards();
      }
    } catch (error) {
      console.error("Failed to save flashcard:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/flashcards/${id}`, {
        method: "DELETE",
      });

      if (latestCardId === id) {
        setLatestCardId(null);
      }

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

      if (latestCardId === id) {
        setLatestCardId(null);
      }

      fetchFlashcards();
    } catch (error) {
      console.error("Failed to mark flashcard as used:", error);
    }
  };

  const handleRestoreCard = async (card) => {
    try {
      await fetch(`${API_BASE}/flashcards/${card.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: card.question,
          answer: card.answer,
          used: false,
        }),
      });

      fetchFlashcards();
    } catch (error) {
      console.error("Failed to restore flashcard:", error);
    }
  };

  const scrollLeft = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({
        left: 320,
        behavior: "smooth",
      });
    }
  };

  const scrollUsedLeft = () => {
    if (usedCardsContainerRef.current) {
      usedCardsContainerRef.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const scrollUsedRight = () => {
    if (usedCardsContainerRef.current) {
      usedCardsContainerRef.current.scrollBy({
        left: 320,
        behavior: "smooth",
      });
    }
  };

  const activeCards = flashcards.filter((card) => !card.used);
  const usedCards = flashcards.filter((card) => card.used);

  return (
    <div className="app">
      <div className="top-section">
        <div className="page-header">
          <div className="title-block">
            <h1 className="main-title">
              Flashcard <span>Learning</span> App
            </h1>
          </div>

          <button
            className="used-toggle-btn"
            type="button"
            onClick={() => setShowUsedCards(!showUsedCards)}
          >
            {showUsedCards ? "Hide Used Cards" : `Show Used Cards (${usedCards.length})`}
          </button>
        </div>

        <div className="section-title-row">
          <h2 className="section-title">Study Cards</h2>
        </div>

        <div className="cards-wrapper">
          <button
            className="scroll-btn left"
            onClick={scrollLeft}
            type="button"
          >
            &#10094;
          </button>

          <div className="cards-scroll-container" ref={cardsContainerRef}>
            {activeCards.length === 0 ? (
              <div className="empty-card">No active flashcards available.</div>
            ) : (
              activeCards.map((card) => (
                <div
                  key={card.id}
                  className={`flashcard ${latestCardId === card.id ? "flashcard-highlight" : ""
                    }`}
                >
                  <div
                    className="flashcard-content"
                    onClick={() => handleReveal(card.id)}
                  >
                    <h3>{card.question}</h3>
                    {card.showAnswer ? (
                      <p>{card.answer}</p>
                    ) : (
                      <p className="hint-text">Click card to reveal answer</p>
                    )}
                  </div>

                  <div className="card-actions">
                    <button type="button" onClick={() => handleEdit(card)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(card.id)}>
                      Delete
                    </button>
                    <button type="button" onClick={() => handleUseCard(card.id)}>
                      Used
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="scroll-btn right"
            onClick={scrollRight}
            type="button"
          >
            &#10095;
          </button>
        </div>

        {showUsedCards && (
          <div className="used-section">
            <div className="section-title-row">
              <h2 className="section-title">Used Cards</h2>
            </div>

            <div className="cards-wrapper">
              <button
                className="scroll-btn left"
                onClick={scrollUsedLeft}
                type="button"
              >
                &#10094;
              </button>

              <div className="cards-scroll-container" ref={usedCardsContainerRef}>
                {usedCards.length === 0 ? (
                  <div className="empty-card">No used flashcards yet.</div>
                ) : (
                  usedCards.map((card) => (
                    <div key={card.id} className="flashcard used-flashcard">
                      <div
                        className="flashcard-content"
                        onClick={() => handleReveal(card.id)}
                      >
                        <h3>{card.question}</h3>
                        {card.showAnswer ? (
                          <p>{card.answer}</p>
                        ) : (
                          <p className="hint-text">Click card to reveal answer</p>
                        )}
                      </div>

                      <div className="card-actions">
                        <button type="button" onClick={() => handleEdit(card)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(card.id)}>
                          Delete
                        </button>
                        <button type="button" onClick={() => handleRestoreCard(card)}>
                          Restore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className="scroll-btn right"
                onClick={scrollUsedRight}
                type="button"
              >
                &#10095;
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-form-bar">
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
      </div>
    </div>
  );
}

export default FlashcardApp;