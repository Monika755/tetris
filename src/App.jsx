import { useState, useEffect, useRef } from "react";
import "./App.css";
import { getRandomPiece } from "./shapes";

const width = 10;
const height = 20;

const rotate = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = [];
  for (let c = 0; c < cols; c++) {
    const newRow = [];
    for (let r = rows - 1; r >= 0; r--) newRow.push(matrix[r][c]);
    rotated.push(newRow);
  }
  return rotated;
};

function App() {
  const [board, setBoard] = useState(() =>
    Array(height).fill(null).map(() => Array(width).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece);
  const [nextPiece, setNextPiece] = useState(getRandomPiece);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const intervalRef = useRef(null);

  const placePiece = (board, piece) => {
    const newBoard = board.map((r) => [...r]);
    piece.shape.forEach((r, i) =>
      r.forEach((cell, j) => {
        if (cell) {
          const x = piece.col + j;
          const y = piece.row + i;
          if (y >= 0 && y < height && x >= 0 && x < width) {
            newBoard[y][x] = piece.color;
          }
        }
      })
    );
    return newBoard;
  };

  const hasCollision = (piece, newRow, newCol) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (
          piece.shape[r][c] &&
          (
            newRow + r >= height ||
            newCol + c < 0 ||
            newCol + c >= width ||
            (newRow + r >= 0 && board[newRow + r][newCol + c])
          )
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const clearRows = (board) => {
    const newBoard = board.filter((row) => row.some((cell) => !cell));
    const cleared = height - newBoard.length;
    while (newBoard.length < height) newBoard.unshift(Array(width).fill(null));
    return { newBoard, cleared };
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPiece((prev) => {
        const nextRow = prev.row + 1;
        if (hasCollision(prev, nextRow, prev.col)) {
          setBoard((board) => {
            const updated = placePiece(board, prev);
            const { newBoard, cleared } = clearRows(updated);
            if (cleared > 0) setScore((prevScore) => prevScore + cleared * 100);
            return newBoard;
          });

          if (prev.row === 0) {
            clearInterval(intervalRef.current);
            setIsGameOver(true);
            return prev;
          }

          const incoming = nextPiece;
          setNextPiece(getRandomPiece());
          return incoming;
        }
        return { ...prev, row: nextRow };
      });
    }, 400);

    return () => clearInterval(intervalRef.current);
  }, [nextPiece]);

  useEffect(() => {
    const handler = (e) => {
      if (!currentPiece || isGameOver) return;

      if (e.key === "ArrowLeft" && !hasCollision(currentPiece, currentPiece.row, currentPiece.col - 1)) {
        setCurrentPiece({ ...currentPiece, col: currentPiece.col - 1 });
      }

      if (e.key === "ArrowRight" && !hasCollision(currentPiece, currentPiece.row, currentPiece.col + 1)) {
        setCurrentPiece({ ...currentPiece, col: currentPiece.col + 1 });
      }

      if (e.key === "ArrowDown" && !hasCollision(currentPiece, currentPiece.row + 1, currentPiece.col)) {
        setCurrentPiece({ ...currentPiece, row: currentPiece.row + 1 });
      }

      if (e.key === "ArrowUp") {
        const rotated = rotate(currentPiece.shape);
        const candidate = { ...currentPiece, shape: rotated };
        if (!hasCollision(candidate, currentPiece.row, currentPiece.col)) {
          setCurrentPiece(candidate);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentPiece, isGameOver]);

  const restart = () => {
    setBoard(Array(height).fill(null).map(() => Array(width).fill(null)));
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setScore(0);
    setIsGameOver(false);
  };

  const renderCell = (row, rIdx, cIdx) => {
    const inPiece = currentPiece.shape.some((r, i) =>
      r.some(
        (val, j) =>
          val && rIdx === currentPiece.row + i && cIdx === currentPiece.col + j
      )
    );
    const color = inPiece ? currentPiece.color : board[rIdx][cIdx];
    return (
      <div
        key={cIdx}
        className="cell"
        style={{ backgroundColor: color || "#1a1a1a" }}
      ></div>
    );
  };

  const renderNext = () => {
    const size = 4;
    const grid = Array(size).fill(null).map(() => Array(size).fill(null));
    nextPiece.shape.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell) grid[i][j] = nextPiece.color;
      })
    );
    return (
      <div className="next-container">
        <h3>Next</h3>
        {grid.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div
                key={j}
                className="cell small"
                style={{ backgroundColor: cell || "#1a1a1a" }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="wrapper">
      {isGameOver && (
        <div className="game-over-banner">
          <h2>Game Over</h2>
          <p>Your score: {score}</p>
          <button onClick={restart}>Play Again</button>
        </div>
      )}
      {renderNext()}
      <h3 className="score">Score: {score}</h3>
      <div className="container">
        {board.map((row, rIdx) => (
          <div key={rIdx} className="row">
            {row.map((_, cIdx) => renderCell(row, rIdx, cIdx))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;