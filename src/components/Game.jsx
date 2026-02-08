import React, { useState, useEffect, useRef } from 'react';
import {
    ENGLISH_ALPHABET,
    HANGUL_CONSONANTS,
    HANGUL_CONSONANT_NAMES,
    HANGUL_CONSONANT_SOUNDS,
    HANGUL_SYLLABLES,
    NUMBERS,
    NUMBERS_KOREAN_NATIVE,
    NUMBERS_KOREAN_SINO,
    NUMBERS_ENGLISH
} from '../utils/characters';

const Game = ({ mode, onBack }) => {
    const [displayChar, setDisplayChar] = useState('');
    const [soundChar, setSoundChar] = useState('');
    const [subChar, setSubChar] = useState('');
    const [animate, setAnimate] = useState(false);
    const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(() => {
        const saved = localStorage.getItem('autoPlay');
        return saved === 'true'; // Default to false if not set
    });

    // Store previous random index to avoid duplicates
    const previousIndexRef = useRef(null);
    // Store current sequential index
    const sequentialIndexRef = useRef(-1);

    const getDataSet = () => {
        if (mode.mode === 'english') {
            return { display: ENGLISH_ALPHABET, sound: ENGLISH_ALPHABET };
        }

        if (mode.mode === 'hangul') {
            if (mode.subMode === 'names') {
                return { display: HANGUL_CONSONANTS, sound: HANGUL_CONSONANT_NAMES };
            }
            if (mode.subMode === 'sounds') {
                return { display: HANGUL_CONSONANTS, sound: HANGUL_CONSONANT_SOUNDS };
            }
            if (mode.subMode === 'syllables') {
                return { display: HANGUL_SYLLABLES, sound: HANGUL_SYLLABLES };
            }
        }

        if (mode.mode === 'number') {
            if (mode.subMode === 'korean-native') {
                return { display: NUMBERS, sound: NUMBERS_KOREAN_NATIVE };
            }
            if (mode.subMode === 'korean-sino') {
                return { display: NUMBERS, sound: NUMBERS_KOREAN_SINO };
            }
            if (mode.subMode === 'english') {
                return { display: NUMBERS, sound: NUMBERS_ENGLISH };
            }
        }

        return { display: [], sound: [] };
    };

    const generateNextChar = (autoPlay = false) => {
        const dataset = getDataSet();
        let nextIndex;

        if (mode.order === 'sequential') {
            // Sequential logic
            nextIndex = (sequentialIndexRef.current + 1) % dataset.display.length;
            sequentialIndexRef.current = nextIndex;
        } else {
            // Random logic with duplicate prevention
            do {
                nextIndex = Math.floor(Math.random() * dataset.display.length);
            } while (nextIndex === previousIndexRef.current && dataset.display.length > 1);
            previousIndexRef.current = nextIndex;
        }

        const newDisplayChar = dataset.display[nextIndex];
        const newSoundChar = dataset.sound[nextIndex];

        setDisplayChar(newDisplayChar);
        setSoundChar(newSoundChar);

        if (mode.mode === 'english') {
            setSubChar(newDisplayChar.toLowerCase());
        } else {
            setSubChar('');
        }

        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);

        if (autoPlay && isAutoPlayEnabled) {
            playSound(newSoundChar);
        }
    };

    const playSound = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            if (mode.mode === 'english') {
                utterance.lang = 'en-US';
                // Convert to lowercase for speech to avoid "Capital A" pronunciation issues
                utterance.text = text.toLowerCase();
            } else if (mode.mode === 'number' && mode.subMode === 'english') {
                utterance.lang = 'en-US'; // Use native English pronunciation for numbers
            } else {
                utterance.lang = 'ko-KR';
            }

            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Reset sequential index on mount
        sequentialIndexRef.current = -1;
        generateNextChar(isAutoPlayEnabled); // Auto-play on init if enabled

        return () => {
            // Cancel speech when component unmounts or effect re-runs
            // This prevents double playback in React Strict Mode
            window.speechSynthesis.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const getBackgroundStyle = () => {
        if (mode.mode === 'english') return 'var(--gradient-english)';
        if (mode.mode === 'hangul') return 'var(--gradient-hangul)';
        if (mode.mode === 'number') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        return 'var(--gradient-menu)';
    };

    const handlePlaySound = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();

        // Trigger animation
        setAnimate(false); // Reset first to ensure re-trigger
        setTimeout(() => setAnimate(true), 10);
        setTimeout(() => setAnimate(false), 310);

        if (soundChar) {
            playSound(soundChar);
        }
    };

    const toggleAutoPlay = (e) => {
        e.stopPropagation();
        const newState = !isAutoPlayEnabled;
        setIsAutoPlayEnabled(newState);
        localStorage.setItem('autoPlay', newState);
    };

    return (
        <div
            className="game-container"
            onClick={handlePlaySound} // Screen tap plays sound
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                background: getBackgroundStyle(),
                position: 'relative',
                userSelect: 'none'
            }}
        >
            {/* Header Controls */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '20px',
                paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                zIndex: 10,
                pointerEvents: 'none' // Let clicks pass through to container
            }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBack();
                    }}
                    style={{
                        fontSize: '1rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        pointerEvents: 'auto', // Re-enable clicks
                        flexShrink: 0,
                        width: 'auto' // Override global button width
                    }}
                >
                    ← 뒤로
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={toggleAutoPlay}
                        style={{
                            fontSize: '1rem',
                            padding: '0.5rem 1rem',
                            background: isAutoPlayEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                            color: 'white',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            pointerEvents: 'auto', // Re-enable clicks
                            marginBottom: '5px',
                            whiteSpace: 'nowrap',
                            width: 'auto' // Override global button width
                        }}
                    >
                        {isAutoPlayEnabled ? '🔊 자동' : '🔇 수동'}
                    </button>

                    {mode.order === 'sequential' && (
                        <div
                            style={{
                                fontSize: '0.9rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                background: 'transparent',
                                padding: '4px 8px',
                                pointerEvents: 'auto',
                                whiteSpace: 'nowrap',
                                marginTop: '5px',
                                fontWeight: '500',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}
                        >
                            🔢 순서대로
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`character-display ${animate ? 'pop' : ''}`}
                style={{
                    fontSize: '15rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 10px 20px rgba(0,0,0,0.2)',
                    transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    marginBottom: subChar ? '0' : '0'
                }}
            >
                {displayChar}
            </div>

            {subChar && (
                <div
                    style={{
                        fontSize: '6rem',
                        fontWeight: '500',
                        color: 'rgba(255,255,255,0.8)',
                        textShadow: '0 5px 10px rgba(0,0,0,0.1)',
                        marginTop: '-2rem'
                    }}
                >
                    {subChar}
                </div>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    generateNextChar(true); // Button generates next char
                }}
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '3rem',
                    padding: '1rem 2rem',
                    background: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '50px',
                    zIndex: 10,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    width: 'auto' // Override global button width
                }}
            >
                ➡️
            </button>

            <style>{`
        .pop {
          animation: popAnimation 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popAnimation {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default Game;
