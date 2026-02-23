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
            </p>
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 20px', paddingBottom: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h2 style={{ fontSize: '1.2rem', textAlign: 'left', margin: 0, paddingLeft: '0.5rem', color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>✏️ 기초 학습</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => handleMainModeSelect('english')}
                            style={{ background: 'var(--gradient-english)', color: 'white', border: 'none', aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '24px' }}
                        >
                            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem', fontWeight: '800' }}>ABC</span>
                            알파벳
                        </button>
                        <button
                            onClick={() => handleMainModeSelect('hangul')}
                            style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none', aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '24px' }}
                        >
                            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem', fontWeight: '800' }}>가나다</span>
                            한글
                        </button>
                        <button
                            onClick={() => handleMainModeSelect('number')}
                            style={{ gridColumn: '1 / -1', background: 'var(--gradient-number)', color: 'white', border: 'none', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '24px' }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem', fontWeight: '800' }}>123</span>
                                숫자
                            </div>
                            <div style={{ fontSize: '3rem', opacity: 0.8 }}>🔢</div>
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h2 style={{ fontSize: '1.2rem', textAlign: 'left', margin: 0, paddingLeft: '0.5rem', color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>🐾 동물 친구들</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => handleMainModeSelect('animals')}
                            style={{
                                gridColumn: '1 / -1',
                                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 100%), url("/assets/animals-poster.jpg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 40%',
                                color: 'white',
                                border: 'none',
                                padding: '1.5rem 2rem',
                                minHeight: '130px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                borderRadius: '24px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                            }}
                        >
                            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.2rem', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>동물</span>
                            <span style={{ fontSize: '1.1rem', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>이름 말하기</span>
                        </button>
                        <button
                            onClick={() => onStartGame({ mode: 'animals', subMode: 'zootopia', order: 'random' })}
                            style={{
                                backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%), url("/assets/zootopia-poster.jpg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 20%',
                                color: 'white',
                                border: 'none',
                                aspectRatio: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                alignItems: 'flex-start',
                                padding: '1.2rem',
                                borderRadius: '24px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)' }}>주토피아</span>
                            <span style={{ fontSize: '0.9rem', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>영어로 말하기</span>
                        </button>
                        <button
                            onClick={() => onStartGame({ mode: 'animals', subMode: 'zootopia2', order: 'random' })}
                            style={{
                                backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%), url("/assets/zootopia2-poster.jpg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 20%',
                                color: 'white',
                                border: 'none',
                                aspectRatio: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                alignItems: 'flex-start',
                                padding: '1.2rem',
                                borderRadius: '24px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)' }}>주토피아 2</span>
                            <span style={{ fontSize: '0.9rem', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>영어로 말하기</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderEnglishMenu = () => (
        <>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ABC</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>알파벳</h2>
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
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>동물 이름</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>영어로 말하기</h2>
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
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>가나다</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>한글</h2>
            <div className="button-group">
                <button
                    onClick={() => handleSubModeSelect('names')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>자음</span>
                    기역, 니은, 디귿
                </button>
                <button
                    onClick={() => handleSubModeSelect('sounds')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>자음</span>
                    그, 느, 드
                </button>
                <button
                    onClick={() => handleSubModeSelect('vowels')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>모음</span>
                    ㅏ, ㅑ, ㅓ, ㅕ
                </button>
                <button
                    onClick={() => handleSubModeSelect('syllables')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>가 나 다</span>
                </button>
                <button
                    onClick={() => handleSubModeSelect('double')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>된소리</span>
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
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>1 2 3</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>숫자</h2>
            <div className="button-group">
                <button
                    onClick={() => handleSubModeSelect('korean-native')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>1 2 3</span>
                    하나, 둘, 셋
                </button>
                <button
                    onClick={() => handleSubModeSelect('korean-sino')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>1 2 3</span>
                    일, 이, 삼
                </button>
                <button
                    onClick={() => handleSubModeSelect('place-values')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>1, 10, 100...</span>
                    자릿수 읽기
                </button>
                <button
                    onClick={() => handleSubModeSelect('english')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>1 ~ 10</span>
                    영어 숫자 읽기
                </button>
                <button
                    onClick={() => handleDirectStart('random-10-100')}
                    style={{ background: 'var(--gradient-number)', color: 'white', border: 'none' }}
                >
                    <span style={{ fontSize: '1.2rem', display: 'block', opacity: 0.9 }}>10 ~ 100</span>
                    영어 숫자 읽기
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
        let subTitle = '순서를 선택하세요';

        if (selectedMode === 'english') {
            bgStyle = 'var(--gradient-english)';
            if (selectedSubMode === 'alphabet') {
                modeTitle = '알파벳 이름';
                subTitle = 'A, B, C';
            } else if (selectedSubMode === 'sounds') {
                modeTitle = '알파벳 소리';
                subTitle = '애, 브, 크';
            }
        } else if (selectedMode === 'hangul') {
            bgStyle = 'var(--gradient-hangul)';
            if (selectedSubMode === 'names') {
                modeTitle = '자음';
                subTitle = '기역, 니은, 디귿';
            } else if (selectedSubMode === 'sounds') {
                modeTitle = '자음';
                subTitle = '그, 느, 드';
            } else if (selectedSubMode === 'syllables') {
                modeTitle = '가 나 다';
                subTitle = '글자로 배우기';
            } else if (selectedSubMode === 'vowels') {
                modeTitle = '모음';
                subTitle = 'ㅏ, ㅑ, ㅓ, ㅕ';
            } else if (selectedSubMode === 'double') {
                modeTitle = '된소리';
                subTitle = 'ㄲ, ㄸ, ㅃ, ㅆ, ㅉ';
            }
        } else if (selectedMode === 'number') {
            bgStyle = 'var(--gradient-number)';
            if (selectedSubMode === 'korean-native') {
                modeTitle = '1 2 3';
                subTitle = '하나, 둘, 셋';
            } else if (selectedSubMode === 'korean-sino') {
                modeTitle = '1 2 3';
                subTitle = '일, 이, 삼';
            } else if (selectedSubMode === 'place-values') {
                modeTitle = '1, 10, 100...';
                subTitle = '자릿수 읽기';
            } else if (selectedSubMode === 'english') {
                modeTitle = '1 ~ 10';
                subTitle = '영어 숫자 읽기';
            }
        }

        return (
            <>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{modeTitle}</h1>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '400', opacity: 0.9 }}>{subTitle}</h2>
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
