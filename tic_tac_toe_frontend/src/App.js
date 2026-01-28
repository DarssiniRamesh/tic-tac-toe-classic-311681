import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { validateMove } from "./api";

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return v;
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function Square({ value, onClick, disabled, highlight }) {
  /** Single square in the tic-tac-toe grid. */
  return (
    <button
      type="button"
      className={`ttt-square${highlight ? " ttt-square--highlight" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Square ${value}` : "Empty square"}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onPlay, disabled, winningLine }) {
  /** Renders the 3x3 board and delegates click handling to onPlay(index). */
  return (
    <div className="ttt-board" role="grid" aria-label="Tic tac toe board">
      {squares.map((value, idx) => (
        <Square
          key={idx}
          value={value}
          onClick={() => onPlay(idx)}
          disabled={disabled || Boolean(value)}
          highlight={winningLine ? winningLine.includes(idx) : false}
        />
      ))}
    </div>
  );
}

function calculateWinningLine(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}

function isDraw(squares) {
  return squares.every(Boolean);
}

// PUBLIC_INTERFACE
function App() {
  /** Main app entrypoint: local tic-tac-toe gameplay with theme-aligned UI. */
  const [theme] = useState("light"); // Keep light theme per style guide.
  const [squares, setSquares] = useState(() => Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const winningLine = useMemo(() => calculateWinningLine(squares), [squares]);
  const draw = useMemo(() => !winner && isDraw(squares), [winner, squares]);

  const currentPlayer = xIsNext ? "X" : "O";

  const status = useMemo(() => {
    if (winner) {
      return { text: `${winner} wins!`, tone: "success" };
    }
    if (draw) {
      return { text: "It's a draw.", tone: "error" };
    }
    return { text: `${currentPlayer}'s turn`, tone: "primary" };
  }, [winner, draw, currentPlayer]);

  // PUBLIC_INTERFACE
  const resetGame = () => {
    /** Clears the board and starts a new game with X. */
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  // PUBLIC_INTERFACE
  const handlePlay = async (index) => {
    /** Handles a move for the current player at a given index (0..8). */
    if (winner || squares[index]) return;

    // Optional: allow future backend validation without making gameplay dependent on it.
    // This is intentionally "best-effort" and non-blocking.
    try {
      await validateMove({ board: squares, index, player: currentPlayer });
    } catch (e) {
      // Ignore validation issues for now.
    }

    setSquares((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
    setXIsNext((prev) => !prev);
  };

  const boardDisabled = Boolean(winner) || draw;

  return (
    <div className="App">
      <main className="ttt-page">
        <section className="ttt-card" aria-label="Tic tac toe game">
          <h1 className="ttt-title">Tic‑Tac‑Toe</h1>

          <div
            className={`ttt-status ttt-status--${status.tone}`}
            role="status"
            aria-live="polite"
          >
            {status.text}
          </div>

          <Board
            squares={squares}
            onPlay={handlePlay}
            disabled={boardDisabled}
            winningLine={winningLine}
          />

          <div className="ttt-actions">
            <button
              type="button"
              className="ttt-reset"
              onClick={resetGame}
              aria-label="Reset game"
            >
              Reset Game
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
