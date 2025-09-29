import { useState, useEffect } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";

export interface Item {
  id: number;
  name: string;
  quantity: number;
}

function App() {
  // const [count, setCount] = useState(0)
  const [parts, setParts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 여기에 실제 API 주소 입력
    fetch("http://localhost:8080/api/v1/parts")
      .then((res) => res.json())
      .then((data: Item[]) => {
        setParts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);
  return (
    <>
      <div>
        <ul>
          {parts.map((part) => (
            <li key={part.id}>
              <strong>{part.name}</strong>: {part.quantity}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
