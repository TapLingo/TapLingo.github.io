import React, { useState, useEffect, useRef } from 'react';
import {
    ENGLISH_ALPHABET,
    HANGUL_CONSONANTS,
    HANGUL_CONSONANT_NAMES,
    HANGUL_CONSONANT_SOUNDS,
    HANGUL_SYLLABLES,
    HANGUL_VOWELS,
    HANGUL_VOWEL_NAMES,
    HANGUL_DOUBLE_CONSONANTS,
    HANGUL_DOUBLE_CONSONANT_NAMES,
    HANGUL_DOUBLE_CONSONANT_SOUNDS,
    NUMBERS,
    NUMBERS_KOREAN_NATIVE,
    NUMBERS_KOREAN_SINO,
    NUMBERS_ENGLISH,
    PLACE_VALUES,
    PLACE_VALUES_KOREAN,
    PLACE_VALUES_ENGLISH,
    SEA_ANIMALS,
    LAND_ANIMALS,
    INSECT_ANIMALS,
    ZOOTOPIA_ANIMALS
} from '../utils/characters.json';
import { TFCS_IPA, TFCS_SOUNDS, TFCS_ALPHABETS } from '../utils/tfcs_chars.json';

const Game = ({ mode, onBack }) => {
    const [displayChar, setDisplayChar] = useState('');
    const [soundChar, setSoundChar] = useState('');
    const [subChar, setSubChar] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(() => {
        const saved = localStorage.getItem('autoPlay');
        return saved === 'true'; // Default to false if not set
    });

    // Store previous random index to avoid duplicates
    const previousIndexRef = useRef(null);
    const shuffledIndicesRef = useRef([]); // Shuffle bag
    const recentNumbersRef = useRef([]); // History for random-10-100
    const sequentialIndexRef = useRef(-1);
    const currentAudioRef = useRef(null);

    const safeName = (text) => {
        if (!text) return '';
        return text.toString().trim()
            .replace(/\//g, '')
            .replace(/[?<>:*|"\\/]/g, '')
            .replace(/\s+/g, '_');
    };

    const getAudioPath = (text, categoryOverride = null) => {
        if (categoryOverride === 'zootopia_char') {
            return `/audio/animals/zootopia_char/${safeName(text)}.mp3`;
        }

        if (mode.mode === 'english') {
            if (mode.subMode === 'sounds') return `/audio/tfcs/${text}.mp3`;
            return `/audio/english/alphabet/${safeName(text)}.mp3`;
        }

        if (mode.mode === 'hangul') {
            if (mode.subMode === 'names') return `/audio/hangul/names/${safeName(text)}.mp3`;
            if (mode.subMode === 'sounds') return `/audio/hangul/sounds/${safeName(text)}.mp3`;
            if (mode.subMode === 'syllables') return `/audio/hangul/syllables/${safeName(text)}.mp3`;
            if (mode.subMode === 'vowels') return `/audio/hangul/vowels/${safeName(text)}.mp3`;
            if (mode.subMode === 'double') return `/audio/hangul/double_sounds/${safeName(text)}.mp3`;
            return `/audio/hangul/syllables/${safeName(text)}.mp3`;
        }

        if (mode.mode === 'number') {
            if (mode.subMode === 'korean-native') return `/audio/number/native/${safeName(text)}.mp3`;
            if (mode.subMode === 'korean-sino') return `/audio/number/sino/${safeName(text)}.mp3`;
            if (mode.subMode === 'english') return `/audio/number/english/${safeName(text)}.mp3`;
            if (mode.subMode === 'place-values') return `/audio/number/place_ko/${safeName(text)}.mp3`;
            if (mode.subMode === 'random-10-100') return `/audio/number/random_en/${safeName(text)}.mp3`;
            return `/audio/number/english/${safeName(text)}.mp3`;
        }

        if (mode.mode === 'animals') {
            if (mode.subMode === 'zootopia') return `/audio/animals/zootopia_en/${safeName(text)}.mp3`;
            return `/audio/animals/basic/${safeName(text)}.mp3`;
        }

        return '';
    };

    const getDataSet = () => {
        if (mode.mode === 'english') {
            if (mode.subMode === 'sounds') {
                return { display: TFCS_ALPHABETS, sound: TFCS_SOUNDS, sub: TFCS_IPA };
            }
            return { display: ENGLISH_ALPHABET, sound: ENGLISH_ALPHABET };
        }

        if (mode.mode === 'animals') {
            if (mode.subMode === 'animals-sea') {
                return { animalData: SEA_ANIMALS };
            }
            if (mode.subMode === 'animals-land') {
                return { animalData: LAND_ANIMALS };
            }
            if (mode.subMode === 'animals-insects') {
                return { animalData: INSECT_ANIMALS };
            }
            if (mode.subMode === 'zootopia') {
                return { zootopiaData: ZOOTOPIA_ANIMALS, lang: 'en' };
            }
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
            if (mode.subMode === 'vowels') {
                return { display: HANGUL_VOWELS, sound: HANGUL_VOWEL_NAMES };
            }
            if (mode.subMode === 'double') {
                return { display: HANGUL_DOUBLE_CONSONANTS, sound: HANGUL_DOUBLE_CONSONANT_SOUNDS };
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
            if (mode.subMode === 'place-values') {
                return { display: PLACE_VALUES, sound: PLACE_VALUES_KOREAN };
            }
            if (mode.subMode === 'random-10-100') {
                return { dynamic: true };
            }
        }

        return { display: [], sound: [] };
    };

    const getNextRandomIndex = (length) => {
        if (length <= 0) return 0;
        if (length === 1) return 0;

        if (shuffledIndicesRef.current.length === 0) {
            const newIndices = Array.from({ length }, (_, i) => i);
            // Fisher-Yates Shuffle
            for (let i = newIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newIndices[i], newIndices[j]] = [newIndices[j], newIndices[i]];
            }

            // Avoid repeating the last item of the previous bag as the first item of the new bag
            if (previousIndexRef.current !== null && newIndices[0] === previousIndexRef.current) {
                const lastIdx = newIndices.length - 1;
                [newIndices[0], newIndices[lastIdx]] = [newIndices[lastIdx], newIndices[0]];
            }
            shuffledIndicesRef.current = newIndices;
        }

        const nextIndex = shuffledIndicesRef.current.pop();
        previousIndexRef.current = nextIndex;
        return nextIndex;
    };

    const generateNextChar = (autoPlay = false) => {
        const dataset = getDataSet();

        if (dataset.dynamic && mode.subMode === 'random-10-100') {
            let num;
            let attempts = 0;
            do {
                num = Math.floor(Math.random() * 91) + 10;
                attempts++;
            } while (recentNumbersRef.current.includes(num) && attempts < 50);

            // Keep history of last 15 numbers to avoid "soon" repetition
            recentNumbersRef.current.push(num);
            if (recentNumbersRef.current.length > 15) recentNumbersRef.current.shift();

            const numStr = String(num);
            setDisplayChar(numStr);
            setSoundChar(numStr);
            setSubChar('');
            setImageUrl(null);

            setAnimate(true);
            setTimeout(() => setAnimate(false), 300);

            if (autoPlay && isAutoPlayEnabled) {
                playSound(numStr);
            }
            return;
        }

        if (dataset.animalData) {
            let nextIndex;
            if (mode.order === 'sequential') {
                nextIndex = (sequentialIndexRef.current + 1) % dataset.animalData.length;
                sequentialIndexRef.current = nextIndex;
            } else {
                nextIndex = getNextRandomIndex(dataset.animalData.length);
            }

            const animal = dataset.animalData[nextIndex];
            setDisplayChar('');
            setImageUrl(animal.image);
            setSoundChar(animal.name);
            setSubChar(animal.name);
            setCharacterName('');

            setAnimate(true);
            setTimeout(() => setAnimate(false), 300);

            if (autoPlay && isAutoPlayEnabled) {
                playSound(animal.name);
            }
            return;
        }

        if (dataset.zootopiaData) {
            let nextIndex;
            if (mode.order === 'sequential') {
                nextIndex = (sequentialIndexRef.current + 1) % dataset.zootopiaData.length;
                sequentialIndexRef.current = nextIndex;
            } else {
                nextIndex = getNextRandomIndex(dataset.zootopiaData.length);
            }

            const animal = dataset.zootopiaData[nextIndex];
            const animalName = dataset.lang === 'en' ? animal.english : animal.korean;
            setDisplayChar(animalName);
            setImageUrl(animal.image);
            setSoundChar(animalName);
            setSubChar(animalName);
            setCharacterName(animal.character);

            setAnimate(true);
            setTimeout(() => setAnimate(false), 300);

            if (autoPlay && isAutoPlayEnabled) {
                playSound(animalName);
            }
            return;
        }

        let nextIndex;

        if (mode.order === 'sequential') {
            nextIndex = (sequentialIndexRef.current + 1) % dataset.display.length;
            sequentialIndexRef.current = nextIndex;
        } else {
            nextIndex = getNextRandomIndex(dataset.display.length);
        }

        const newDisplayChar = dataset.display[nextIndex];
        const newSoundChar = dataset.sound[nextIndex];

        setDisplayChar(newDisplayChar);
        setSoundChar(newSoundChar);
        setImageUrl(null);

        if (dataset.sub) {
            setSubChar(dataset.sub[nextIndex]);
        } else if (mode.mode === 'english') {
            setSubChar(newDisplayChar.toLowerCase());
        } else {
            setSubChar('');
        }
        setCharacterName('');

        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);

        if (autoPlay && isAutoPlayEnabled) {
            playSound(newSoundChar);
        }
    };

    const playSound = (text, categoryOverride = null) => {
        if (!text) return;

        // Stop currently playing audio if any
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }

        const audioPath = getAudioPath(text, categoryOverride);
        if (audioPath) {
            const audio = new Audio(audioPath);
            currentAudioRef.current = audio;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    useEffect(() => {
        // Reset sequential index on mount
        sequentialIndexRef.current = -1;
        shuffledIndicesRef.current = []; // Reset shuffle bag
        recentNumbersRef.current = [];   // Reset number history
        generateNextChar(isAutoPlayEnabled); // Auto-play on init if enabled

        return () => {
            // Cleanup audio on unmount or effect re-run
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const getBackgroundStyle = () => {
        if (mode.mode === 'english') return 'var(--gradient-english)';
        if (mode.mode === 'hangul') return 'var(--gradient-hangul)';
        if (mode.mode === 'number') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        if (mode.mode === 'animals') return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
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
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                background: imageUrl ? '#050505' : 'transparent',
                userSelect: 'none',
                zIndex: 100,
                overflow: 'hidden'
            }}
        >
            {/* Header Controls */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '20px',
                paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 10px)', // Reduced spacing
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
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.2)',
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
                            background: isAutoPlayEnabled ? 'rgba(76, 175, 80, 0.8)' : 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.2)',
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


                </div>
            </div>

            {imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt=""
                        style={{
                            position: 'absolute',
                            top: '-50px', left: '-50px', right: '-50px', bottom: '-50px',
                            width: 'calc(100% + 100px)', height: 'calc(100% + 100px)',
                            objectFit: 'cover',
                            filter: 'blur(30px) brightness(0.6)',
                            zIndex: 0
                        }}
                    />
                    <img
                        src={imageUrl}
                        alt={subChar}
                        className="animal-display"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            zIndex: 1
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </>
            ) : (
                <div
                    className={`character-display ${animate ? 'pop' : ''}`}
                    style={{
                        fontSize: displayChar.length > 8 ? '4rem' : (displayChar.length > 3 ? '8rem' : '15rem'),
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 10px 20px rgba(0,0,0,0.2)',
                        transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        marginBottom: subChar ? '0' : '0',
                        textTransform: (mode.subMode?.startsWith('animals-') || (mode.subMode === 'zootopia')) ? 'capitalize' : 'none'
                    }}
                >
                    {displayChar}
                </div>
            )}

            {imageUrl ? (
                <div style={{
                    position: 'absolute',
                    bottom: '130px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '400px',
                    padding: '20px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 5,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    {subChar && (
                        <div className={animate ? 'pop' : ''} style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: 'white',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            lineHeight: 1.1,
                            textAlign: 'center',
                            textTransform: 'capitalize'
                        }}>
                            {subChar}
                        </div>
                    )}
                    {characterName && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                const target = e.currentTarget;
                                target.style.transform = 'scale(1.1)';
                                target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                                setTimeout(() => {
                                    target.style.transform = 'scale(1)';
                                    target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                                }, 200);
                                playSound(characterName, 'zootopia_char');
                            }}
                            style={{
                                fontSize: '1.4rem',
                                color: 'rgba(255,255,255,0.9)',
                                background: 'rgba(255,255,255,0.15)',
                                padding: '8px 20px',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>🗣️</span> {characterName}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {subChar && (
                        <div
                            style={{
                                fontSize: mode.subMode?.startsWith('animals-') ? '2.5rem' : (subChar.length > 3 ? '3rem' : '6rem'),
                                fontWeight: '500',
                                color: 'rgba(255,255,255,0.8)',
                                textShadow: '0 5px 10px rgba(0,0,0,0.1)',
                                marginTop: mode.subMode?.startsWith('animals-') ? '1.5rem' : '-2rem',
                                textTransform: mode.subMode?.startsWith('animals-') ? 'capitalize' : 'none'
                            }}
                        >
                            {subChar}
                        </div>
                    )}

                    {characterName && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                const target = e.currentTarget;
                                target.style.transform = 'scale(1.1)';
                                target.style.color = 'white';
                                setTimeout(() => {
                                    target.style.transform = 'scale(1)';
                                    target.style.color = 'rgba(255,255,255,0.6)';
                                }, 200);
                                playSound(characterName, 'zootopia_char');
                            }}
                            style={{
                                fontSize: '1.2rem',
                                fontWeight: '400',
                                color: 'rgba(255,255,255,0.6)',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                marginTop: '0.5rem',
                                fontStyle: 'italic',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                padding: '5px 10px',
                                borderRadius: '10px'
                            }}
                        >
                            {characterName}
                        </div>
                    )}
                </>
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
                    width: 'auto',
                    height: 'auto',
                    borderRadius: '50px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    zIndex: 10,
                    padding: '1rem 2.5rem'
                }}
            >
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>다음</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
