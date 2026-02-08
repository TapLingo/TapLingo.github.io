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
    const view = params.get('view') || 'main';

    if (mode && order) {
      return {
        inGame: true,
        gameConfig: { mode, subMode, order }
      };
    }

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

  // ✅ [수정됨] 배경색 결정을 위한 로직 분리 (렌더링 시 계산)
  const getThemeInfo = () => {
    const mode = gameState.inGame ? gameState.gameConfig.mode : gameState.selectedMode;

    let bg = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
    let themeColor = '#e0c3fc';

    if (mode === 'english') {
      bg = 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
      themeColor = '#a18cd1';
    } else if (mode === 'hangul') {
      bg = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
      themeColor = '#84fab0';
    } else if (mode === 'number') {
      bg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      themeColor = '#667eea';
    }

    return { bg, themeColor };
  };

  const { bg, themeColor } = getThemeInfo();

  // ✅ [수정됨] useEffect는 이제 'theme-color' 메타 태그만 관리합니다.
  // 배경색 변경 시 브라우저 UI(상단바 등) 색상을 맞추기 위함입니다.
  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColor);
    }
    // html과 body에 배경색 적용 (스크롤 바운스 시 보이는 색상)
    document.documentElement.style.backgroundColor = themeColor;
    document.body.style.backgroundColor = themeColor;
  }, [themeColor]);

  const updateUrl = (params) => {
    const url = new URL(window.location);
    url.search = '';
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.set(key, params[key]);
    });
    window.history.pushState({}, '', url);
    setGameState(getGameStateFromUrl());
  };

  const onNavigateMenu = (view, mode = null, subMode = null) => {
    const params = {};
    if (view !== 'main') params.view = view;
    if (mode) params.mode = mode;
    if (subMode) params.sub = subMode;
    updateUrl(params);
  };

  const onStartGame = (config) => {
    const params = {
      mode: config.mode,
      order: config.order
    };
    if (config.subMode) params.sub = config.subMode;
    updateUrl(params);
  };

  const onBackToMenu = () => {
    window.history.back();
  };

  return (
    <div className="app">
      {/* ✅ [추가됨] 배경 전용 레이어 */}
      {/* 이 div가 화면 뒤에 고정되어 모든 Safe Area 이슈를 해결합니다 */}
      <div
        style={{
          position: 'fixed',
          top: '-100px', // 상단 Safe Area 커버
          left: '-100px',
          right: '-100px',
          bottom: '-100px', // 하단 Safe Area 커버
          background: bg,
          zIndex: -1,
          transition: 'background 0.5s ease'
        }}
      />

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