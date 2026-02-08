import React, { useState } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState(null); // null, 'english', 'hangul'

  return (
    <div className="app">
      {!gameMode && <Menu onSelectMode={setGameMode} />}
      {gameMode && <Game mode={gameMode} onBack={() => setGameMode(null)} />}
    </div>
  );
}

export default App;
