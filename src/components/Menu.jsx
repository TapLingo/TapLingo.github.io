import React, { useState } from 'react';

const Menu = ({ onSelectMode }) => {
    const [showHangulOptions, setShowHangulOptions] = useState(false);
    const [showNumberOptions, setShowNumberOptions] = useState(false);

    const handleModeSelect = (mode, subMode = null) => {
        onSelectMode({ mode, subMode });
    };

    return (
        <div className="menu-container">
            <h1>Tap Lingo</h1>
            <div className="button-group">
                {!showHangulOptions && !showNumberOptions && (
                    <>
                        <button
                            className="menu-button english"
                            onClick={() => handleModeSelect('english')}
                            style={{ background: 'var(--gradient-english)', color: 'white' }}
                        >
                            알파벳
                        </button>
                        <button
                            className="menu-button hangul"
                            onClick={() => setShowHangulOptions(true)}
                            style={{ background: 'var(--gradient-hangul)', color: 'white' }}
                        >
                            한글
                        </button>
                        <button
                            className="menu-button number"
                            onClick={() => setShowNumberOptions(true)}
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                        >
                            숫자
                        </button>
                    </>
                )}

                {showHangulOptions && (
                    <>
                        <button
                            className="menu-button"
                            onClick={() => handleModeSelect('hangul', 'names')}
                            style={{ background: 'var(--gradient-hangul)', color: 'white', fontSize: '1.2em' }}
                        >
                            기역, 니은, 디귿...
                        </button>
                        <button
                            className="menu-button"
                            onClick={() => handleModeSelect('hangul', 'sounds')}
                            style={{ background: 'var(--gradient-hangul)', color: 'white', fontSize: '1.2em' }}
                        >
                            그, 느, 드...
                        </button>
                        <button
                            className="menu-button"
                            onClick={() => setShowHangulOptions(false)}
                            style={{ background: 'rgba(255,255,255,0.2)', color: '#333', fontSize: '1rem' }}
                        >
                            ← 뒤로
                        </button>
                    </>
                )}

                {showNumberOptions && (
                    <>
                        <button
                            className="menu-button"
                            onClick={() => handleModeSelect('number', 'korean-native')}
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '1.2em' }}
                        >
                            하나, 둘, 셋...
                        </button>
                        <button
                            className="menu-button"
                            onClick={() => handleModeSelect('number', 'korean-sino')}
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '1.2em' }}
                        >
                            일, 이, 삼...
                        </button>
                        <button
                            className="menu-button"
                            onClick={() => handleModeSelect('number', 'english')}
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '1.2em' }}
                        >
                            one, two, three...
                        </button>
                        <button
                            className="menu-button"
                            onClick={() => setShowNumberOptions(false)}
                            style={{ background: 'rgba(255,255,255,0.2)', color: '#333', fontSize: '1rem' }}
                        >
                            ← 뒤로
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Menu;
