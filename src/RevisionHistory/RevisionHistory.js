import React from "react";
import "./RevisionHistory.css";
import { useSelector } from "react-redux";
const RevisionHistory = () => {
  const history = useSelector((state) => state.revisionHistory);
  //console.log(history);
  return (
    <div className="revision-history-container">
      <h2 className="flex center">Activity Log</h2>
      <ul className="revision-list">
        {history.map((item, index) => (
          <li key={index} className="revision-item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RevisionHistory;
