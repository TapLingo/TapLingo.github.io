import React from 'react';

const Menu = ({ currentView, selectedMode, selectedSubMode, onNavigate, onStartGame }) => {

    const handleMainModeSelect = (mode) => {
        if (mode === 'english') {
            onNavigate('order', mode, null);
        } else if (mode === 'hangul') {
            onNavigate('hangul', mode, null);
        } else if (mode === 'number') {
            onNavigate('number', mode, null);
        }
    };

    const handleSubModeSelect = (subMode) => {
        onNavigate('order', selectedMode, subMode);
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
            <h1 style={{ marginBottom: '0.5rem' }}>Tap Lingo</h1>
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
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>우리말 숫자</span>
                    하나, 둘, 셋
                </button>
                <button
                    onClick={() => handleSubModeSelect('korean-sino')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>한자어 숫자</span>
                    일, 이, 삼
                </button>
                <button
                    onClick={() => handleSubModeSelect('english')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>영어 숫자</span>
                    One, Two, Three
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
            {currentView === 'hangul' && renderHangulMenu()}
            {currentView === 'number' && renderNumberMenu()}
            {currentView === 'order' && renderOrderMenu()}
        </div>
    );
};

export default Menu;
