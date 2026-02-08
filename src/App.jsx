import React, { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(getGameStateFromUrl());

  function getGameStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const subMode = params.get('sub');
    const order = params.get('order');
    const view = params.get('view') || 'main'; // For menu navigation state

    // If we have full game parameters, we are in game mode
    if (mode && order) {
      return {
        inGame: true,
        gameConfig: { mode, subMode, order }
      };
    }

    // Otherwise we are in menu
    return {
      inGame: false,
      menuView: view,
      selectedMode: mode,
      selectedSubMode: subMode
    };
  }

  useEffect(() => {
    const handlePopState = () => {
      setGameState(getGameStateFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (params) => {
    const url = new URL(window.location);
    url.search = ''; // Clear current params
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.set(key, params[key]);
    });
    window.history.pushState({}, '', url);
    setGameState(getGameStateFromUrl());
  };

  // Menu navigation handlers
  const onNavigateMenu = (view, mode = null, subMode = null) => {
    const params = {};
    if (view !== 'main') params.view = view;
    if (mode) params.mode = mode;
    if (subMode) params.sub = subMode;
    updateUrl(params);
  };

  // Game start handler
  const onStartGame = (config) => {
    const params = {
      mode: config.mode,
      order: config.order
    };
    if (config.subMode) params.sub = config.subMode;
    updateUrl(params);
  };

  // Back to menu handler (from game)
  const onBackToMenu = () => {
    // Go back to the previous menu state
    window.history.back();
  };

  return (
    <div className="app">
      {!gameState.inGame && (
        <Menu
          currentView={gameState.menuView || 'main'}
          selectedMode={gameState.selectedMode}
          selectedSubMode={gameState.selectedSubMode}
          onNavigate={onNavigateMenu}
          onStartGame={onStartGame}
        />
      )}
      {gameState.inGame && (
        <Game
          mode={gameState.gameConfig}
          onBack={onBackToMenu}
        />
      )}
    </div>
  );
}

export default App;
