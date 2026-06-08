import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isGoogleHovered, setIsGoogleHovered] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log("Successfully logged in as:", user.displayName);
        } catch (error) {
            console.error("Google authentication failed:", error.message);
        }
    };


    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                // await createUserWithEmailAndPassword(auth, email, password);
                if (password !== confirmPassword) {
                    setError("Passwords do not match!");
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                await updateProfile(userCredential.user, {
                    displayName: fullName
                });
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
                <h1 style={titleStyle}>StreamHop</h1>
                <p style={subtitleStyle}>
                    {isRegistering ? 'Create your account' : 'Sign in to your account'}
                </p>

                <form onSubmit={handleAuth} style={formStyle}>
                    {isRegistering && (
                        <div style={inputGroup}>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}
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

                    {isRegistering && (
                        <div style={inputGroup}>
                            <label style={labelStyle}>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Repeat your password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}

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


                <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '20px 0', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                    <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    onMouseEnter={() => setIsGoogleHovered(true)}
                    onMouseLeave={() => setIsGoogleHovered(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #d1d5db',
                        backgroundColor: isGoogleHovered ? '#f9fafb' : '#ffffff',
                        color: '#374151',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block' }}>
                        <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.8 2.17c1.63-1.51 2.57-3.74 2.57-6.5z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.8-2.17c-.78.52-1.78.83-3.16.83-2.43 0-4.49-1.64-5.22-3.85H.97v2.24A9 9 0 0 0 9 18z" />
                        <path fill="#FBBC05" d="M3.78 10.63c-.19-.57-.3-1.18-.3-1.81s.11-1.24.3-1.81V4.77H.97A9 9 0 0 0 0 9c0 1.54.39 3.01 1.07 4.3l2.71-2.67z" />
                        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.97 4.77l2.81 2.18c.73-2.21 2.79-3.85 5.22-3.85z" />
                    </svg>
                    Continue with Google
                </button>

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
    minHeight: '100vh',
    width: '100vw',
    background: 'radial-gradient(circle at top left, #4f46e5 0%, #1e1b4b 100%)',
    backgroundAttachment: 'fixed',
    backgroundAttachment: 'fixed',
    fontFamily: "'Inter', sans-serif",
};

const cardStyle = {
    padding: '40px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    margin: 'auto'
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