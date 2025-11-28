import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./App.css";

function App() {
  const [players, setPlayers] = useState({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    // Fetch player data
    fetch("/api/players")
      .then((response) => response.json())
      .then((data) => {
        console.log("Players data:", data);
        setPlayers(data);

        const newNodes = Object.entries(data).map(([name, score], index) => ({
          id: name,
          type: "default",
          data: {
            label: (
              <div>
                <strong>{name}</strong>
                <div>Score: {score}</div>
              </div>
            ),
          },
          position: {
            x: 100 + (index % 4) * 250,
            y: 100 + Math.floor(index / 4) * 150,
          },
          style: {
            background: "#4CAF50",
            color: "white",
            border: "2px solid #2E7D32",
            borderRadius: "8px",
            padding: "10px",
            width: 180,
          },
        }));

        console.log("Created nodes:", newNodes);
        setNodes(newNodes);

        const newEdges = [];
        const entries = Object.entries(data);
        for (let i = 0; i < entries.length; i++) {
          for (let j = i + 1; j < entries.length; j++) {
            const [name1, score1] = entries[i];
            const [name2, score2] = entries[j];

            // Connect players if their scores are within 10 points
            if (Math.abs(score1 - score2) <= 10) {
              newEdges.push({
                id: `e${name1}-${name2}`,
                source: name1,
                target: name2,
                animated: true,
                style: { stroke: "#888" },
              });
            }
          }
        }

        setEdges(newEdges);
      })
      .catch((error) => console.error("Error fetching players:", error));
  }, [setNodes, setEdges]);

  return (
    <div className="App">
      <h1>Player Scores Dashboard</h1>

      <div className="table-container">
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(players)
              .sort((a, b) => b[1] - a[1])
              .map(([name, score]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{score}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flow-container">
        <h2>Player Network</h2>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
