import React, { useState, useEffect } from "react";
import "./App.css";

type Players = "O" | "X";

function App() {
  const [turn, setTurn] = useState<Players>("O"); // Turno entre X ou O
  const [winner, setWinner] = useState<Players | null>(null); // Define o ganhador
  const [draw, setDraw] = useState<boolean | null>(null); // Define se existe empate
  const [choice, setChoice] = useState<Players | null>(null); // Representa a escolha do jogador entre X ou O
  const [isCPU, setIsCPU] = useState(false); // Habilita o modo contra CPU
  const [currentPlayer, setCurrentPlayer] = useState<Players>("O"); // Controla o jogador atual
  const [history, setHistory] = useState<string[]>([]); // Armazena o histórico das partidas
  const [marks, setMarks] = useState<Players[]>(new Array(9).fill(null)); // Define as "casas" do jogo da velha
  const [isCPUMoving, setIsCPUMoving] = useState(false); // Verifica se a CPU está jogando na rodada ou não

  const gameOver = !!winner || !!draw; // Define o final da partida
  const cpuSymbol = choice === "O" ? "X" : "O"; // Permite que a CPU alterne entre Simbolos durante as partidas

  const play = (index: number) => { // função para jogar no modo 2 jogadores
    if (marks[index] || gameOver) { // Não permite que marque uma casa ocupada ou quando o jogo tiver terminado
      return;
    }

    const updatedMarks = [...marks]; // atualiza as casas ocupadas
    updatedMarks[index] = turn;
    setMarks(updatedMarks);

    const nextPlayer = turn === "O" ? "X" : "O"; // Define o símbolo a ser jogado na rodada seguinte
    setCurrentPlayer(nextPlayer);
    setTurn(nextPlayer);
  };

  const playCPU = () => { // função para jogar no modo CPU
    if (currentPlayer === cpuSymbol && !gameOver) { // Controla quando a CPU deve jogar (apenas se for o símbolo da rodada e se o jogo não tiver acabado)
      const availableSquares = marks.reduce((acc, mark, index) => (mark ? acc : [...acc, index]),[] as number[]); // Transforma as casas disponíveis em um array

      if (availableSquares.length === 0) { // Se não houver mais nenhuma casa disponível, a CPU não joga
        return;
      }
  
      if (isCPUMoving) { 
        return;
      }

      setIsCPUMoving(true);

      setTimeout(() => { // Define um delay entre as jogadas da CPU 
        const randomIndex = Math.floor(Math.random() * availableSquares.length); // Escolhe um numero randomico como index 
        const squareIndex = availableSquares[randomIndex]; // Define a casa em que a CPU irá jogar
        const updatedMarks = [...marks]; 

        updatedMarks[squareIndex] = cpuSymbol; // Atualiza as casas do jogo
        setMarks(updatedMarks);

        const nextPlayer = cpuSymbol === "O" ? "X" : "O"; 
        setCurrentPlayer(nextPlayer);
        setTurn(nextPlayer);
        setIsCPUMoving(false);

      }, 300);
    }
  };

  const getWinner = () => { // funçao para definir o ganhador
    const victoryLines = [ // Conjunto com as posições ganhadoras
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 4, 8],
      [2, 4, 6],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];

    for (const line of victoryLines) { // Verifica se um conjunto de 3 símbolos estão em uma das posições ganhadoras 
      const [a, b, c] = line;

      if (marks[a] && marks[a] === marks[b] && marks[a] === marks[c]) {
        return marks[a]; // Se for retorna o ganhador
      }
    }
    return null;
  };

  const checkDraw = () => { // função para verificar o empate
    return marks.every((mark) => mark !== null); // Retorna se todas as casas estão ocupadas e não há nenhum vencedor
  };

  const handleChoice = (e: React.FormEvent<HTMLFormElement>) => { // função para definir qual o símbolo do jogador
    e.preventDefault();
    if (choice !== null) {
      setTurn(choice);
      setCurrentPlayer(choice);
    }
  };

  const reset = () => { // função para reiniciar a partida no final
    setTurn(choice);
    setMarks(new Array(9).fill(null));
    setWinner(null);
    setDraw(null);
  };


  useEffect(() => { // controla quando há uma vitória, empate e se a CPU está jogando 
    const winner = getWinner();

    if (winner) {
      setWinner(winner);
      setHistory((prevHistory) => [...prevHistory, `${winner} ganhou`]); // Registra no histórico qual símbolo ganhou
    } 
    else if (checkDraw()) {
      setDraw(true);
      setHistory((prevHistory) => [...prevHistory, `Empate`]); // Registra o empate no histórico
    } 
    else if (isCPU && currentPlayer === cpuSymbol && marks.some((mark) => mark !== null)) { // Impede que a CPU faça a primeira rodada
      playCPU();
    }
  }, [marks, currentPlayer]);  

  return (
    <>
      <div className="app">
        {/* A tela de histórico e jogar novamente só aparece quando o jogo termina */}
        {gameOver && (
          <div className="history">
            Histórico de partidas:
            <ul>
              {history.map((match, index) => (<li key={index}>{match}</li>))}
            </ul>
            <button onClick={reset}>Jogar novamente</button>
          </div>)}
        {/* Formulário para escolher o símbolo */}
        <form onSubmit={handleChoice}>
          <label>
            Escolha:{" "}
            <select
              value={choice || ""}
              onChange={(e) => setChoice(e.target.value as Players)}
            >
              <option value="">Selecione</option>
              <option value="O">O</option>
              <option value="X">X</option>
            </select>
          </label>
          {/* Checkbox para ativar o modo CPU */}
          <label>
            Jogar contra CPU:
            <input type="checkbox" checked={isCPU} onChange={() => setIsCPU((prev) => !prev)}/>
          </label>
          <button type="submit">Começar</button>
        </form>
        
        {winner && <h1>{winner} ganhou</h1>}
        {draw && <h1>Empate</h1>}
        {!gameOver && <p>É a vez de {turn}</p>}
        
        {/* Casas do jogo da velha */}
        <div className={`table ${gameOver ? "gameOver" : ""}`}>
          {marks.map((mark, index) => (
            <div key={index} className={`squares ${mark}`} onClick={() => play(index)}>
              {mark}
            </div>
            ))}
        </div>
      </div>
    </>
  );
}
export default App;
