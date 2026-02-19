import React from 'react';

const Menu = ({ currentView, selectedMode, selectedSubMode, onNavigate, onStartGame }) => {

    const handleMainModeSelect = (mode) => {
        if (mode === 'english') {
            onNavigate('english', mode, null);
        } else if (mode === 'hangul') {
            onNavigate('hangul', mode, null);
        } else if (mode === 'number') {
            onNavigate('number', mode, null);
        } else if (mode === 'animals') {
            onNavigate('animals', mode, null);
        }
    };

    const handleSubModeSelect = (subMode) => {
        onNavigate('order', selectedMode, subMode);
    };

    const handleDirectStart = (subMode) => {
        onStartGame({
            mode: selectedMode,
            subMode: subMode,
            order: 'random'
        });
    };

    const handleOrderSelect = (order) => {
        onStartGame({
            mode: selectedMode,
            subMode: selectedSubMode,
            order: order
        });
    };

    const goBack = () => {
        window.history.back();
    };

    const renderMainMenu = () => (
        <>
            <h1 style={{ marginBottom: '0.5rem' }}>어린이 공부방</h1>
            <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2.5rem',
                fontWeight: '400',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
                터치하며 배우는 영어·한글·숫자
            </p>
            <div className="button-group">
                <button
                    onClick={() => handleMainModeSelect('english')}
                    style={{ background: 'var(--gradient-english)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem' }}>ABC</span>
                    알파벳
                </button>
                <button
                    onClick={() => handleMainModeSelect('hangul')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem' }}>가나다</span>
                    한글
                </button>
                <button
                    onClick={() => handleMainModeSelect('number')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem' }}>123</span>
                    숫자
                </button>
                <button
                    onClick={() => handleMainModeSelect('animals')}
                    style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem' }}>🐾</span>
                    동물공부
                </button>
                <button
                    onClick={() => onStartGame({ mode: 'animals', subMode: 'zootopia', order: 'random' })}
                    style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem' }}>🦊</span>
                    주토피아
                </button>
            </div>
        </>
    );

    const renderEnglishMenu = () => (
        <>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>영어 모드</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>어떻게 배울까요?</h2>
            <div className="button-group">
                <button
                    onClick={() => handleSubModeSelect('alphabet')}
                    style={{ background: 'var(--gradient-english)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>알파벳 이름</span>
                    A, B, C
                </button>
                <button
                    onClick={() => handleSubModeSelect('sounds')}
                    style={{ background: 'var(--gradient-english)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>알파벳 소리</span>
                    애, 브, 크
                </button>
                <button
                    className="back-button"
                    onClick={goBack}
                >
                    ← 뒤로
                </button>
            </div>
        </>
    );

    const renderAnimalsMenu = () => (
        <>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>동물공부</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>어떤 동물을 배울까요?</h2>
            <div className="button-group">
                <button
                    onClick={() => handleDirectStart('animals-sea')}
                    style={{ background: 'linear-gradient(135deg, #0077B6, #00B4D8)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>바다 동물</span>
                    🐳 🐬 🦈
                </button>
                <button
                    onClick={() => handleDirectStart('animals-land')}
                    style={{ background: 'linear-gradient(135deg, #606C38, #DDA15E)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>육지 동물</span>
                    🦁 🐘 🐯
                </button>
                <button
                    onClick={() => handleDirectStart('animals-insects')}
                    style={{ background: 'linear-gradient(135deg, #BC6C25, #FEFAE0)', color: '#333', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>곤충</span>
                    🦋 🐝 🐞
                </button>

                <button
                    className="back-button"
                    onClick={goBack}
                >
                    ← 뒤로
                </button>
            </div>
        </>
    );

    const renderHangulMenu = () => (
        <>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>한글 모드</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>어떻게 배울까요?</h2>
            <div className="button-group">
                <button
                    onClick={() => handleSubModeSelect('names')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>이름으로 배우기</span>
                    기역, 니은, 디귿
                </button>
                <button
                    onClick={() => handleSubModeSelect('sounds')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>소리로 배우기</span>
                    그, 느, 드
                </button>
                <button
                    onClick={() => handleSubModeSelect('syllables')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>글자로 배우기</span>
                    가, 나, 다
                </button>
                <button
                    onClick={() => handleSubModeSelect('vowels')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>모음 배우기</span>
                    ㅏ, ㅑ, ㅓ, ㅕ
                </button>
                <button
                    onClick={() => handleSubModeSelect('double')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>된소리 배우기</span>
                    ㄲ, ㄸ, ㅃ, ㅆ, ㅉ
                </button>
                <button
                    className="back-button"
                    onClick={goBack}
                >
                    ← 뒤로
                </button>
            </div>
        </>
    );

    const renderNumberMenu = () => (
        <>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>숫자 모드</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>어떤 숫자를 배울까요?</h2>
            <div className="button-group">
                <button
                    onClick={() => handleSubModeSelect('korean-native')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>숫자 읽기</span>
                    하나, 둘, 셋
                </button>
                <button
                    onClick={() => handleSubModeSelect('korean-sino')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>숫자 읽기</span>
                    일, 이, 삼
                </button>
                <button
                    onClick={() => handleSubModeSelect('place-values')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>자릿수 읽기</span>
                    1, 10, 100, 1000...
                </button>
                <button
                    onClick={() => handleSubModeSelect('english')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>영어 숫자 읽기</span>
                    1 ~ 10
                </button>
                <button
                    onClick={() => handleDirectStart('random-10-100')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>영어 숫자 읽기</span>
                    10 ~ 100
                </button>
                <button
                    className="back-button"
                    onClick={goBack}
                >
                    ← 뒤로
                </button>
            </div>
        </>
    );

    const renderOrderMenu = () => {
        let bgStyle = 'var(--gradient-menu)';
        let modeTitle = '학습 설정';

        if (selectedMode === 'english') {
            bgStyle = 'var(--gradient-english)';
            modeTitle = '알파벳';
        } else if (selectedMode === 'hangul') {
            bgStyle = 'var(--gradient-hangul)';
            modeTitle = '한글';
        } else if (selectedMode === 'number') {
            bgStyle = 'var(--gradient-number)';
            modeTitle = '숫자';
        }

        return (
            <>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{modeTitle}</h1>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>순서를 선택하세요</h2>
                <div className="button-group">
                    <button
                        onClick={() => handleOrderSelect('random')}
                        style={{ background: bgStyle, color: 'white', border: 'none' }}
                    >
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎲</span>
                        무작위
                    </button>
                    <button
                        onClick={() => handleOrderSelect('sequential')}
                        style={{ background: bgStyle, color: 'white', border: 'none' }}
                    >
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🔢</span>
                        순서대로
                    </button>
                    <button
                        className="back-button"
                        onClick={goBack}
                    >
                        ← 뒤로
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="menu-container" style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            {currentView === 'main' && renderMainMenu()}
            {currentView === 'english' && renderEnglishMenu()}
            {currentView === 'animals' && renderAnimalsMenu()}
            {currentView === 'hangul' && renderHangulMenu()}
            {currentView === 'number' && renderNumberMenu()}
            {currentView === 'order' && renderOrderMenu()}
        </div>
    );
};

export default Menu;
