import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles.css';

/* ──────────────────────────────────────────
   Question Bank — each item can have a
   `condition(answers)` that returns true/false
   to decide whether to show it.
   ────────────────────────────────────────── */
const QUESTION_BANK = [
    // ── Core Demographics ──
    {
        id: 'age',
        text: "How old are you?",
        type: 'number',
        placeholder: "e.g. 45"
    },
    {
        id: 'sex',
        text: "What is your biological sex?",
        type: 'options',
        options: [
            { label: 'Male', value: 1 },
            { label: 'Female', value: 0 }
        ]
    },

    // ── Chest / Heart Symptoms ──
    {
        id: 'cp',
        text: "Do you experience any chest discomfort?",
        type: 'options',
        options: [
            { label: 'Often', value: 0 },
            { label: 'Sometimes', value: 1 },
            { label: 'Rarely', value: 2 },
            { label: 'Never', value: 3 }
        ]
    },
    {
        id: 'exang',
        text: "Does the chest discomfort happen during exercise or physical work?",
        type: 'options',
        // Only ask if chest pain is Often (0) or Sometimes (1)
        condition: (a) => a.cp === 0 || a.cp === 1,
        options: [
            { label: 'Yes', value: 1 },
            { label: 'No', value: 0 }
        ]
    },
    {
        id: 'thalach',
        text: "Do you feel unusually tired during physical activity?",
        type: 'options',
        options: [
            { label: 'Yes', value: 120 },
            { label: 'Sometimes', value: 145 },
            { label: 'No', value: 170 }
        ]
    },

    // ── Clinical Markers ──
    {
        id: 'trestbps',
        text: "Do you know your blood pressure level?",
        type: 'options',
        info: "High blood pressure increases strain on your heart and arteries.",
        options: [
            { label: 'Normal (Less than 120/80 mmHg)', value: 110 },
            { label: 'Slightly High (120–139 / 80–89 mmHg)', value: 130 },
            { label: 'High (140/90 mmHg or above)', value: 150 },
            { label: "I don't know", value: 120 }
        ]
    },
    {
        id: 'bp_medication',
        text: "Are you currently taking medication for blood pressure?",
        type: 'options',
        // Only ask if BP is Slightly High or High
        condition: (a) => a.trestbps === 130 || a.trestbps === 150,
        options: [
            { label: 'Yes', value: 1 },
            { label: 'No', value: 0 }
        ]
    },
    {
        id: 'chol',
        text: "Do you know your cholesterol level?",
        type: 'options',
        info: "High cholesterol can increase the risk of heart disease.",
        options: [
            { label: 'Normal (Below 200 mg/dL)', value: 180 },
            { label: 'Borderline High (200–239 mg/dL)', value: 220 },
            { label: 'High (240 mg/dL or higher)', value: 260 },
            { label: "I don't know", value: 200 }
        ]
    },
    {
        id: 'fbs',
        text: "Do you know your fasting blood sugar level?",
        type: 'options',
        info: "Elevated blood sugar is a key risk factor for heart disease.",
        options: [
            { label: 'Normal (Below 100 mg/dL)', value: 0 },
            { label: 'Prediabetes (100–125 mg/dL)', value: 0 },
            { label: 'Diabetes Level (126 mg/dL or higher)', value: 1 },
            { label: "I don't know", value: 0 }
        ]
    },
    {
        id: 'diabetes_medication',
        text: "Are you currently taking medication for diabetes?",
        type: 'options',
        // Only ask if blood sugar indicates diabetes
        condition: (a) => a.fbs === 1,
        options: [
            { label: 'Yes', value: 1 },
            { label: 'No', value: 0 }
        ]
    },

    // ── Lifestyle ──
    {
        id: 'sleep_hours',
        text: "How many hours do you usually sleep each night?",
        type: 'number',
        placeholder: "e.g. 7"
    },
    {
        id: 'stress_level',
        text: "How would you rate your daily stress level?",
        type: 'options',
        options: [
            { label: 'Low (Calm & relaxed)', value: 2 },
            { label: 'Moderate (Some pressure)', value: 5 },
            { label: 'High (Very stressed)', value: 8 },
            { label: 'Extreme (Overwhelmed)', value: 10 }
        ]
    },
    {
        id: 'junk_food_freq',
        text: "How often do you eat fast food or junk food per week?",
        type: 'options',
        options: [
            { label: 'Rarely or never', value: 0 },
            { label: '1–2 times', value: 2 },
            { label: '3–5 times', value: 4 },
            { label: 'Almost daily', value: 6 }
        ]
    },
    {
        id: 'exercise_level',
        text: "How often do you exercise each week?",
        type: 'options',
        options: [
            { label: 'Never', value: 0 },
            { label: '1–2 times (Light)', value: 1 },
            { label: '3–4 times (Moderate)', value: 2 },
            { label: '5+ times (Active)', value: 3 }
        ]
    },
    {
        id: 'smoking',
        text: "Do you smoke?",
        type: 'options',
        options: [
            { label: 'Yes', value: 1 },
            { label: 'No', value: 0 }
        ]
    },
    {
        id: 'cigarettes_per_day',
        text: "How many cigarettes do you smoke per day?",
        type: 'options',
        // Only ask if smoking = yes
        condition: (a) => a.smoking === 1,
        options: [
            { label: '1–5 (Light)', value: 3 },
            { label: '6–15 (Moderate)', value: 10 },
            { label: '16+ (Heavy)', value: 20 }
        ]
    },
    {
        id: 'alcohol',
        text: "Do you drink alcohol regularly?",
        type: 'options',
        options: [
            { label: 'Yes', value: 1 },
            { label: 'No', value: 0 }
        ]
    },
    {
        id: 'family_history',
        text: "Has anyone in your immediate family had heart disease?",
        type: 'options',
        options: [
            { label: 'Yes', value: 1 },
            { label: 'No', value: 0 },
            { label: "I'm not sure", value: 0 }
        ]
    }
];


const Chatbot = ({ onSubmitComplete }) => {
    const [messages, setMessages] = useState([]);
    const [formData, setFormData] = useState({});
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(-1); // -1 = greeting phase
    const [activeQuestions, setActiveQuestions] = useState([]);
    const [answered, setAnswered] = useState(0);
    const messagesEndRef = useRef(null);

    // Build the active question list based on current answers
    const buildActiveQuestions = useCallback((answers) => {
        return QUESTION_BANK.filter(q => !q.condition || q.condition(answers));
    }, []);

    // Initialize with greeting + first question
    useEffect(() => {
        const initial = buildActiveQuestions({});
        setActiveQuestions(initial);
        setMessages([
            { sender: 'bot', text: "Hello! I'm HeartGuard AI 👋 I'll ask you a few simple health and lifestyle questions to assess your cardiac risk. No medical reports needed!" },
            { sender: 'bot', text: initial[0].text, info: initial[0].info }
        ]);
        setQuestionIndex(0);
    }, [buildActiveQuestions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const currentQuestion = activeQuestions[questionIndex];

    // After recording an answer, recalculate active questions & advance
    const advanceToNext = (newMessages, newFormData) => {
        const updatedQuestions = buildActiveQuestions(newFormData);
        setActiveQuestions(updatedQuestions);
        setAnswered(prev => prev + 1);

        // Find the next question after the current one in the updated list
        const currentId = currentQuestion?.id;
        const currentIdx = updatedQuestions.findIndex(q => q.id === currentId);
        const nextIdx = currentIdx + 1;

        if (nextIdx < updatedQuestions.length) {
            const nextQ = updatedQuestions[nextIdx];
            setQuestionIndex(nextIdx);
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setMessages([
                    ...newMessages,
                    { sender: 'bot', text: nextQ.text, info: nextQ.info }
                ]);
            }, 600);
        } else {
            // All done — submit
            setMessages(newMessages);
            setTimeout(() => {
                onSubmitComplete(newFormData);
            }, 500);
        }
    };

    // Option click handler
    const handleOptionClick = (option) => {
        const userMsg = { sender: 'user', text: option.label };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        const newFormData = { ...formData, [currentQuestion.id]: option.value };
        setFormData(newFormData);

        advanceToNext(newMessages, newFormData);
    };

    // Number input handler
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { sender: 'user', text: inputValue };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        const newFormData = { ...formData, [currentQuestion.id]: inputValue.trim() };
        setFormData(newFormData);
        setInputValue("");

        advanceToNext(newMessages, newFormData);
    };

    // Progress
    const totalQuestions = activeQuestions.length;
    const progress = totalQuestions > 0 ? ((answered + 1) / totalQuestions) * 100 : 0;

    const showOptions = currentQuestion?.type === 'options' && !isTyping;

    return (
        <div className="chatbot-container glass-card fade-in">
            <div className="chat-progress">
                <div className="progress-header">
                    <span className="progress-label">Assessment Progress</span>
                    <span className="progress-count">{Math.min(answered + 1, totalQuestions)} / {totalQuestions}</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            </div>

            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx}>
                            <div className={`message-wrapper ${msg.sender}`}>
                                <div className={`message-bubble ${msg.sender}`}>
                                    {msg.text}
                                </div>
                            </div>
                            {msg.sender === 'bot' && msg.info && (
                                <div className="info-tooltip">
                                    <span className="info-icon">ℹ️</span>
                                    <span>{msg.info}</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}

                    {showOptions && (
                        <div className="option-buttons fade-in">
                            {currentQuestion.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className="option-btn"
                                    onClick={() => handleOptionClick(opt)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {currentQuestion?.type === 'number' && (
                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="number"
                            step="any"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={currentQuestion.placeholder || "Type your answer..."}
                            autoFocus
                        />
                        <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                )}

                {currentQuestion?.type === 'options' && (
                    <div className="chat-options-footer">
                        <span>👆 Tap an option above to continue</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chatbot;
