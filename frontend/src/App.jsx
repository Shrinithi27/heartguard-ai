import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import ResultCard from './components/ResultCard';
import { predictHeartRisk } from './services/api';
import './styles.css';

function App() {
    const [view, setView] = useState('landing'); // landing, chat, loading, result, error
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({});
    const [errorMsg, setErrorMsg] = useState('');

    const handleStart = () => {
        setView('chat');
    };

    const handleSubmit = async (chatFormData) => {
        setView('loading');

        // 1. Infer missing hospital variables to maintain model accuracy
        // Since we removed hospital questions, defaulting them to 0 means "perfectly healthy",
        // which drastically lowers the risk score even if symptoms are severe.
        const mappedData = { ...chatFormData };

        // Infer oldpeak (ST depression) & slope from exercise angina and chest pain
        if (mappedData.exang === 1 || mappedData.cp <= 1) {
            mappedData.oldpeak = 2.5; // High ST depression
            mappedData.slope = 1;     // Flat/downsloping
            mappedData.thal = 3;      // Reversible defect
            mappedData.ca = mappedData.age > 50 ? 2 : 1; // Major vessels
            mappedData.restecg = 1;   // ST-T wave abnormality
        } else {
            mappedData.oldpeak = 0.0;
            mappedData.slope = 2;     // Upsloping (normal)
            mappedData.thal = 2;      // Normal
            mappedData.ca = 0;
            mappedData.restecg = 0;
        }

        // Adjust for extreme BP or Diabetes giving higher ca/thal
        if (mappedData.trestbps >= 150 || mappedData.fbs === 1) {
            mappedData.ca = Math.max(mappedData.ca || 0, 1);
        }

        setFormData(chatFormData); // Keep original for Health Score

        try {
            const response = await predictHeartRisk(mappedData);
            setResult(response);
            setView('result');
        } catch (error) {
            setErrorMsg("Failed to connect to the prediction server. Please try again.");
            setView('error');
        }
    };

    const handleRestart = () => {
        setResult(null);
        setFormData({});
        setErrorMsg('');
        setView('landing');
    };

    return (
        <>
            {/* Animated background */}
            <div className="animated-bg">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            <div className="app-container">
                <header className="app-header">
                    <div className="logo-container">
                        <svg className="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <h1>HeartGuard AI</h1>
                    </div>
                </header>

                <main className="main-content">
                    {view === 'landing' && (
                        <div className="landing-section glass-card fade-in">
                            <div className="hero-badge fade-in-delay-1">
                                <span className="hero-badge-dot"></span>
                                AI-Powered Assessment
                            </div>

                            <h2 className="fade-in-delay-1">
                                Next-Gen <span className="gradient-text">Cardiac Risk</span> Intelligence
                            </h2>

                            <p className="hero-subtitle fade-in-delay-2">
                                Our deep learning model analyzes clinical and lifestyle factors to predict your heart disease risk with high confidence.
                            </p>

                            <div className="features-row fade-in-delay-2">
                                <div className="feature-item">
                                    <div className="feature-icon">🧬</div>
                                    <h4>21 Risk Factors</h4>
                                    <p>Clinical & lifestyle</p>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">⚡</div>
                                    <h4>Instant Results</h4>
                                    <p>Real-time ML inference</p>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">🔒</div>
                                    <h4>Private & Secure</h4>
                                    <p>Data never stored</p>
                                </div>
                            </div>

                            <button className="primary-btn fade-in-delay-3" onClick={handleStart}>
                                Start Assessment
                                <span className="btn-arrow">→</span>
                            </button>
                        </div>
                    )}

                    {view === 'chat' && (
                        <Chatbot onSubmitComplete={handleSubmit} />
                    )}

                    {view === 'loading' && (
                        <div className="loading-container glass-card fade-in">
                            <svg className="loading-heart" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <h3>Analyzing Your Data</h3>
                            <p>Our AI model is processing your cardiac risk profile…</p>
                            <div className="loading-bar">
                                <div className="loading-bar-fill"></div>
                            </div>
                        </div>
                    )}

                    {view === 'result' && (
                        <ResultCard result={result} formData={formData} onRestart={handleRestart} />
                    )}

                    {view === 'error' && (
                        <div className="error-container glass-card fade-in">
                            <div className="error-icon">⚠️</div>
                            <h3>Something went wrong</h3>
                            <p className="error-text">{errorMsg}</p>
                            <button className="primary-btn" onClick={handleRestart}>
                                Try Again
                                <span className="btn-arrow">→</span>
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

export default App;
