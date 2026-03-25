import { useState } from "react";
import "./App.css";

function App() {
  const [op, setOp] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [result, setResult] = useState("");

  const baseUrl = "https://localhost:20443/api/Save-JSON";

  const handleGET = async () => {
    const response = await fetch(baseUrl);
    const data = await response.text();
    setResult(data);
  };

  const handlePOST = async () => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, x: Number(x), y: Number(y) })
    });
    const data = await response.text();
    setResult(data);
  };

  const handlePUT = async () => {
    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, x: Number(x), y: Number(y) })
    });
    const data = await response.text();
    setResult(data);
  };

  const handleDELETE = async () => {
    const response = await fetch(baseUrl, {
      method: "DELETE"
    });
    const data = await response.text();
    setResult(data);
  };

  return (
    <div className="container">
      <h1>TDWA02-02 SPA (React)</h1>

      <div className="inputs">
        <input
          placeholder="Operation (op)"
          value={op}
          onChange={(e) => setOp(e.target.value)}
        />
        <input
          placeholder="X"
          type="number"
          value={x}
          onChange={(e) => setX(e.target.value)}
        />
        <input
          placeholder="Y"
          type="number"
          value={y}
          onChange={(e) => setY(e.target.value)}
        />
      </div>

      <div className="buttons">
        <button onClick={handleGET}>GET</button>
        <button onClick={handlePOST}>POST</button>
        <button onClick={handlePUT}>PUT</button>
        <button onClick={handleDELETE}>DELETE</button>
      </div>

      <div className="result">
        <h3>Result:</h3>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;