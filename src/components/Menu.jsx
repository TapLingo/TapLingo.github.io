import React from 'react';

const Menu = ({ onSelectMode }) => {
    return (
        <div className="menu-container">
            <h1>Tap Lingo</h1>
            <div className="button-group">
                <button
                    className="menu-button english"
                    onClick={() => onSelectMode('english')}
                    style={{ background: 'var(--gradient-english)', color: 'white' }}
                >
                    English
                </button>
                <button
                    className="menu-button hangul"
                    onClick={() => onSelectMode('hangul')}
                    style={{ background: 'var(--gradient-hangul)', color: 'white' }}
                >
                    한글
                </button>
            </div>
        </div>
    );
};

export default Menu;
