import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import './GamePage.css';

function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageURL = location.state?.imageURL;

  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [time, setTime] = useState(0);
  const [timerStopped, setTimerStopped] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [moves, setMoves] = useState(0);
  const [outOfMoves, setOutOfMoves] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  const moveLimitsConfig = {
    1: { easy: 10, medium: 20, hard: 30 },
    2: { easy: 10, medium: 20, hard: 30 },
    3: { easy: 10, medium: 20, hard: 30 },
  };

  const timeLimitsConfig = {
    1: { easy: 60, medium: 50, hard: 40 },
    2: { easy: 40, medium: 30, hard: 25 },
    3: { easy: 30, medium: 25, hard: 20 },
  };

  const levelGridSizes = { easy: 3, medium: 4, hard: 5 };

  const gridSize = levelGridSizes[difficulty] || 4;
  const boardSize = 300;
  const tileSize = boardSize / gridSize;
  const moveLimits = moveLimitsConfig[level][difficulty];
  const timeLimits = timeLimitsConfig[level][difficulty];

  useEffect(() => {
    if (!imageURL) navigate('/');
    startLevel();
  }, [imageURL, difficulty, level, navigate]);

  useEffect(() => {
    let timer;
    if (!isSolved && !timerStopped && !outOfMoves) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev >= timeLimits - 1) {
            clearInterval(timer);
            setTimerStopped(true);
            return timeLimits;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSolved, timerStopped, difficulty, level, outOfMoves, timeLimits]);

  useEffect(() => {
    if (moves >= moveLimits && !isSolved) {
      setTimerStopped(true);
      setOutOfMoves(true);
    }
  }, [moves, difficulty, isSolved, moveLimits]);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startLevel = () => {
    const newTiles = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        newTiles.push({ x, y, id: y * gridSize + x });
      }
    }
    setTiles(shuffleArray(newTiles));
    setTime(0);
    setTimerStopped(false);
    setIsSolved(false);
    setSelectedTile(null);
    setMoves(0);
    setOutOfMoves(false);
    setShowConfetti(false);
    setShowWinMessage(false);
  };

  const shuffleArray = (array) =>
    array
      .map((item) => ({ ...item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort, ...item }) => item);

  const handleTileClick = (index) => {
    if (timerStopped || outOfMoves) return;
    if (selectedTile === null) {
      setSelectedTile(index);
    } else {
      const newTiles = [...tiles];
      [newTiles[selectedTile], newTiles[index]] = [newTiles[index], newTiles[selectedTile]];
      setTiles(newTiles);
      setSelectedTile(null);
      setMoves((prevMoves) => prevMoves + 1);

      if (checkIfSolved(newTiles)) {
        setIsSolved(true);
        setTimeout(() => {
          if (level < 3) {
            alert(`✅ Level ${level} complete! Moving to Level ${level + 1}`);
            setLevel(level + 1);
          } else {
            setShowConfetti(true);
            setShowWinMessage(true);
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        }, 500);
      }
    }
  };

  const checkIfSolved = (tilesArray) => {
    for (let i = 0; i < tilesArray.length; i++) {
      if (tilesArray[i].id !== i) return false;
    }
    return true;
  };

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
  }

  return (
    <div className="game-page">
      {/* Blur background when game over */}
      <div className={`game-overlay ${timerStopped || outOfMoves ? 'blur' : ''}`}>
        {showConfetti && (
          <Confetti width={windowDimensions.width} height={windowDimensions.height} recycle={false} />
        )}
        <h1>🧩 Level {level}</h1>
        <div className="timer-box">⏱️ Time Left: {timeLimits - time}</div>
        <div className="moves-counter">👣 Moves: {moves} / {moveLimits}</div>
        <div>
          <label htmlFor="difficulty">Difficulty:</label>
          <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div
          className="puzzle-board"
          style={{
            width: `${boardSize}px`,
            height: `${boardSize}px`,
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: '5px',
          }}
        >
          {tiles.map((tile, index) => (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                backgroundImage: `url(${imageURL})`,
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${-tile.x * tileSize}px ${-tile.y * tileSize}px`,
                border: selectedTile === index ? '3px solid red' : '1px solid #ccc',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
        {showWinMessage && (
          <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '24px', color: 'green' }}>
            🎉 Congratulations! You won the game! 🎉
          </div>
        )}
        <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Start Again</button>
      </div>

      {/* Restart Popup */}
      {(timerStopped || outOfMoves) && !isSolved && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffe6e6',
          padding: '30px',
          borderRadius: '12px',
          color: '#d10000',
          fontSize: '22px',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '20px' }}>
            {timerStopped ? "❌ Time's up! Try Again!" : "❌ Out of moves! Try Again!"}
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              borderRadius: '8px',
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🔁 Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default GamePage;
