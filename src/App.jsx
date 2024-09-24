import React, { useState, useEffect } from "react";
import "./App.css";
import Player from "./components/Player";
import GameBoard from "./components/GameBoard";
import { WINNING_COMBINATIONS } from "./winning-combinations";
import GameOver from "./components/GameOver";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import MatchHistory from "./components/MatchHistory";
import headerImg from "../public/game-logo.png";

const PLAYERS = {
  X: "Player 1",
  O: "Player 2",
};

const INITIAL_GAME_BOARD = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const MATCH_HISTORY_KEY = "tic_tac_toe_match_history";

function derivedActivePlayer(gameTurns) {
  let currentPlayer = "X";
  if (gameTurns.length > 0 && gameTurns[0].player === "X") {
    currentPlayer = "O";
  }

  return currentPlayer;
}

function derivedGameBoard(gameTurns) {
  let gameBoard = [...INITIAL_GAME_BOARD.map((array) => [...array])];

  for (const turn of gameTurns) {
    const { square, player } = turn;
    const { row, col } = square;
    gameBoard[row][col] = player;
  }

  return gameBoard;
}

function derivedWinner(gameBoard, players) {
  let winner;

  for (const combination of WINNING_COMBINATIONS) {
    const firstSquareSymbol =
      gameBoard[combination[0].row][combination[0].column];
    const secondSquareSymbol =
      gameBoard[combination[1].row][combination[1].column];
    const thirdSquareSymbol =
      gameBoard[combination[2].row][combination[2].column];

    if (
      firstSquareSymbol &&
      firstSquareSymbol === secondSquareSymbol &&
      firstSquareSymbol === thirdSquareSymbol
    ) {
      winner = players[firstSquareSymbol];
    }
  }
  return winner;
}

function App() {
  const [players, setPlayers] = useState(PLAYERS);
  const [gameTurns, setGameTurns] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [currentGameId, setCurrentGameId] = useState(uuidv4());

  useEffect(() => {
    const savedMatchHistory = localStorage.getItem(MATCH_HISTORY_KEY);
    if (savedMatchHistory) {
      setMatchHistory(JSON.parse(savedMatchHistory));
    }
  }, []);

  useEffect(() => {
    const savedGameState = localStorage.getItem(currentGameId);
    if (savedGameState) {
      setGameTurns(JSON.parse(savedGameState));
    }
  }, [currentGameId]);

  useEffect(() => {
    if (gameTurns.length > 0) {
      localStorage.setItem(currentGameId, JSON.stringify(gameTurns));
    }
  }, [gameTurns, currentGameId]);

  const activePlayer = derivedActivePlayer(gameTurns);
  const gameBoard = derivedGameBoard(gameTurns);
  const winner = derivedWinner(gameBoard, players);
  const hasDraw = gameTurns.length === 9 && !winner;

  function handleSelectSquare(rowIndex, colIndex) {
    if (gameBoard[rowIndex][colIndex] || winner || hasDraw) return;

    setGameTurns((prevTurns) => {
      const currentPlayer = derivedActivePlayer(prevTurns);

      const updatedTurns = [
        { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
        ...prevTurns,
      ];
      return updatedTurns;
    });
  }

  function handleRestart() {
    if (winner || hasDraw || gameTurns.length > 0) {
      setMatchHistory((prevHistory) => {
        const matchIndex = prevHistory.findIndex(
          (match) => match.id === currentGameId
        );
        const newHistory = [...prevHistory];

        const matchResult = winner
          ? `${winner} won`
          : hasDraw
          ? "Draw"
          : "Incomplete";

        const playerNames = `${players.X} vs ${players.O}`;

        if (matchIndex > -1) {
          newHistory[matchIndex].result = matchResult;
          newHistory[matchIndex].turns = gameTurns;
          newHistory[matchIndex].players = playerNames;
        } else {
          newHistory.push({
            id: currentGameId,
            result: matchResult,
            turns: gameTurns,
            players: playerNames,
          });
        }

        localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    }

    const newGameId = uuidv4();
    setCurrentGameId(newGameId);
    setGameTurns([]);
  }

  function handlePlayerNameChange(symbol, newName) {
    setPlayers((prevPlayers) => {
      return {
        ...prevPlayers,
        [symbol]: newName,
      };
    });
  }

  function handleResumeGame(gameId) {
    setCurrentGameId(gameId);
    const savedGameState = localStorage.getItem(gameId);
    if (savedGameState) {
      setGameTurns(JSON.parse(savedGameState));
    } else {
      setGameTurns([]);
    }
  }

  return (
    <main>
      <img src={headerImg} alt="not found" />
      <header>
        <h1 className="header">TIC TAC TOE</h1>

        <button className="restart-button" onClick={handleRestart}>
          Restart
        </button>
      </header>
      <div id="game-container">
        <ol id="players" className="highlight-player">
          <Player
            initialName={PLAYERS.X}
            symbol="X"
            isActive={activePlayer === "X"}
            onChangeName={handlePlayerNameChange}
          />
          <Player
            initialName={PLAYERS.O}
            symbol="O"
            isActive={activePlayer === "O"}
            onChangeName={handlePlayerNameChange}
          />
        </ol>
        {(winner || hasDraw) && (
          <GameOver winner={winner} onRestart={handleRestart} />
        )}
        <GameBoard onSelectSquare={handleSelectSquare} board={gameBoard} />
      </div>
      <MatchHistory history={matchHistory} onResumeGame={handleResumeGame} />
    </main>
  );
}

export default App;
