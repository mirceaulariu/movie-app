import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            const msg = err.code === 'auth/invalid-credential' ? "Wrong email or password." : err.message;
            setError(msg);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={logoStyle}>🎬</div>
                <h1 style={titleStyle}>Stream Finder</h1>
                <p style={subtitleStyle}>
                    {isRegistering ? 'Create your account' : 'Sign in to your account'}
                </p>

                <form onSubmit={handleAuth} style={formStyle}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email here"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            placeholder=""
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {error && <div style={errorStyle}>{error}</div>}

                    <button
                        type="submit"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: isHovered ? '#4338ca' : '#4f46e5',
                            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                        }}
                    >
                        {isRegistering ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div style={footerStyle}>
                    {isRegistering ? 'Already have an account?' : 'Don’t have an account yet?'}
                    <span
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={toggleLinkStyle}
                    >
                        {isRegistering ? ' Log in' : ' Sign up'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    background: 'radial-gradient(circle at top left, #4f46e5 0%, #1e1b4b 100%)',
    fontFamily: "'Inter', sans-serif",
};

const cardStyle = {
    padding: '48px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
};

const logoStyle = {
    fontSize: '3rem',
    marginBottom: '10px'
};

const titleStyle = {
    color: '#111827',
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px'
};

const subtitleStyle = {
    color: '#6b7280',
    fontSize: '0.95rem',
    marginBottom: '32px'
};

const formStyle = {
    textAlign: 'left'
};

const inputGroup = {
    marginBottom: '20px'
};

const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    boxSizing: 'border-box',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9fafb',
};

const buttonStyle = {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
    marginTop: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

const errorStyle = {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '15px',
    border: '1px solid #fee2e2'
};

const footerStyle = {
    marginTop: '24px',
    fontSize: '0.9rem',
    color: '#4b5563'
};

const toggleLinkStyle = {
    color: '#4f46e5',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
};

export default Login;