import React from "react";

const MatchHistory = ({ history, onResumeGame }) => {
  return (
    <div id="match-history">
      <header>
        <h2>Match History</h2>
      </header>
      <table className="history-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Player Names</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {history.map((match, index) => (
            <tr key={index}>
              <td>{match.id}</td>
              <td>{match.players}</td>
              <td>
                {match.result}
                {match.result === "Incomplete" && (
                  <button onClick={() => onResumeGame(match.id)}>Resume</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchHistory;
