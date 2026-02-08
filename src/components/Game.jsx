import React, { useState, useEffect, useRef } from 'react';
import {
    ENGLISH_ALPHABET,
    HANGUL_CONSONANTS,
    HANGUL_CONSONANT_NAMES,
    HANGUL_CONSONANT_SOUNDS,
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
    const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
    const previousIndexRef = useRef(null);

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

    const generateRandomChar = (autoPlay = false) => {
        const dataset = getDataSet();
        let randomIndex;

        do {
            randomIndex = Math.floor(Math.random() * dataset.display.length);
        } while (randomIndex === previousIndexRef.current && dataset.display.length > 1);

        previousIndexRef.current = randomIndex;

        const newDisplayChar = dataset.display[randomIndex];
        const newSoundChar = dataset.sound[randomIndex];

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
        generateRandomChar(false);
    }, [mode]);

    const getBackgroundStyle = () => {
        if (mode.mode === 'english') return 'var(--gradient-english)';
        if (mode.mode === 'hangul') return 'var(--gradient-hangul)';
        if (mode.mode === 'number') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        return 'var(--gradient-menu)';
    };

    const handlePlaySound = (e) => {
        e.stopPropagation();
        if (soundChar) {
            playSound(soundChar);
        }
    };

    const toggleAutoPlay = (e) => {
        e.stopPropagation();
        setIsAutoPlayEnabled(!isAutoPlayEnabled);
    };

    return (
        <div
            className="game-container"
            onClick={() => generateRandomChar(true)}
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
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onBack();
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    fontSize: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    zIndex: 10,
                    borderRadius: '12px',
                    cursor: 'pointer'
                }}
            >
                ← 뒤로
            </button>

            <button
                onClick={toggleAutoPlay}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    fontSize: '1rem',
                    padding: '0.5rem 1rem',
                    background: isAutoPlayEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    zIndex: 10,
                    borderRadius: '12px',
                    cursor: 'pointer'
                }}
            >
                {isAutoPlayEnabled ? '🔊 자동' : '🔇 수동'}
            </button>

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
                onClick={handlePlaySound}
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
            >
                ▶️
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
