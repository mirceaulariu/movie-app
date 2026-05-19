import React, { useState, useRef, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from './firebase';


const AccountMenu = ({ user, onViewProfile, onViewNotifications, hasAlert }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div style={containerStyle} ref={menuRef}>
            {/* main button */}
            <button onClick={() => setIsOpen(!isOpen)} style={avatarButtonStyle}>
                {user.email[0].toUpperCase()}

                {hasAlert && (
                    <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }} />
                )}
            </button>

            {/* dropdown menu */}
            {isOpen && (
                <div style={dropdownStyle}>
                    <div style={userInfoStyle}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{user.email}</p>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{/*possible subscription status*/}</span>
                    </div>

                    <hr style={dividerStyle} />

                    <button style={itemStyle} onClick={() => { setIsOpen(false); onViewNotifications(); }}>
                        🔔 Notifications {hasAlert && '🔴'}
                    </button>

                    <button style={itemStyle} onClick={() => { setIsOpen(false); onViewProfile(); }}>
                        👤 My Account
                    </button>

                    <hr style={dividerStyle} />

                    <button
                        style={{ ...itemStyle, color: '#ef4444' }}
                        onClick={() => signOut(auth)}
                    >
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    );
};

const containerStyle = { position: 'absolute', top: '20px', right: '40px', zIndex: 2000 };

const avatarButtonStyle = {
    width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const dropdownStyle = {
    position: 'absolute', top: '55px', right: '0', backgroundColor: 'white',
    borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '220px',
    padding: '10px 0', border: '1px solid #eee', textAlign: 'left'
};

const userInfoStyle = { padding: '10px 20px', borderBottom: 'none' };
const dividerStyle = { border: '0', borderTop: '1px solid #f3f4f6', margin: '5px 0' };
const itemStyle = {
    width: '100%', padding: '12px 20px', border: 'none', backgroundColor: 'transparent',
    textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#374151', transition: '0.2s'
};

export default AccountMenu;