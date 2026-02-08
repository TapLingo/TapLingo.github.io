import React, { useState, useEffect } from 'react';
import { ENGLISH_ALPHABET, ALL_HANGUL } from '../utils/characters';

const Game = ({ mode, onBack }) => {
    const [char, setChar] = useState('');
    const [animate, setAnimate] = useState(false);

    const getDataSet = () => {
        return mode === 'english' ? ENGLISH_ALPHABET : ALL_HANGUL;
    };

    const generateRandomChar = () => {
        const dataset = getDataSet();
        const randomIndex = Math.floor(Math.random() * dataset.length);
        setChar(dataset[randomIndex]);

        // Trigger animation
        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);
    };

    useEffect(() => {
        generateRandomChar();
    }, [mode]);

    const getBackgroundStyle = () => {
        return mode === 'english' ? 'var(--gradient-english)' : 'var(--gradient-hangul)';
    };

    return (
        <div
            className="game-container"
            onClick={generateRandomChar}
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
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
                    zIndex: 10
                }}
            >
                ← Back
            </button>

            <div
                className={`character-display ${animate ? 'pop' : ''}`}
                style={{
                    fontSize: '15rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 10px 20px rgba(0,0,0,0.2)',
                    transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {char}
            </div>

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
