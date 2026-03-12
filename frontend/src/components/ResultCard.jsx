import React, { useMemo } from 'react';
import '../styles.css';

const ResultCard = ({ result, formData, onRestart }) => {
    const probability = result?.probability ?? 0;
    const riskScore = Math.round(probability * 100);

    // Determine category & color class
    let category, colorClass;
    if (riskScore < 25) {
        category = "Low Risk";
        colorClass = "low";
    } else if (riskScore < 50) {
        category = "Moderate Risk";
        colorClass = "moderate";
    } else {
        category = "High Risk";
        colorClass = "high";
    }

    // Confidence: how far the probability is from 0.5
    const confidence = Math.round((Math.abs(probability - 0.5) * 2) * 100);

    // SVG gauge calculation
    const circumference = 2 * Math.PI * 50; // ~314
    const offset = circumference - (riskScore / 100) * circumference;
    const badgeIcon = colorClass === 'low' ? '✓' : colorClass === 'moderate' ? '⚡' : '⚠';

    // ──────────────────────────────────────────
    // Heart Health Score Calculation
    // ──────────────────────────────────────────
    const healthScore = useMemo(() => {
        let score = 100;

        if (!formData) return score;

        // Sleep (Ideal 7-9)
        const sleep = Number(formData.sleep_hours || 7);
        if (sleep < 5) score -= 15;
        else if (sleep < 7) score -= 5;
        else if (sleep > 10) score -= 5;

        // Stress (0-10)
        const stress = Number(formData.stress_level || 0);
        if (stress >= 8) score -= 15;
        else if (stress >= 5) score -= 5;

        // Junk Food (0-6)
        const junk = Number(formData.junk_food_freq || 0);
        if (junk >= 6) score -= 15;
        else if (junk >= 4) score -= 10;
        else if (junk >= 2) score -= 5;

        // Exercise (0=never, 1=light, 2=mod, 3=active)
        const exercise = Number(formData.exercise_level || 0);
        if (exercise === 0) score -= 15;
        else if (exercise === 1) score -= 5;

        // Smoking & Alcohol
        const smoking = Number(formData.smoking || 0);
        if (smoking === 1) {
            score -= 15;
            const cigs = Number(formData.cigarettes_per_day || 0);
            if (cigs >= 20) score -= 10;
            else if (cigs >= 10) score -= 5;
        }

        if (Number(formData.alcohol || 0) === 1) score -= 5;
        if (Number(formData.family_history || 0) === 1) score -= 10;

        return Math.max(0, Math.min(100, score));
    }, [formData]);

    const healthScoreColor = healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'danger';

    return (
        <div className="result-card-container fade-in">
            <h2>Assessment Complete</h2>

            <div className="result-card glass-card">
                {/* Circular Gauge */}
                <div className="gauge-section">
                    <div className="gauge-wrapper">
                        <svg className="gauge-svg" viewBox="0 0 120 120">
                            <circle className="gauge-track" cx="60" cy="60" r="50" />
                            <circle
                                className={`gauge-fill ${colorClass}`}
                                cx="60"
                                cy="60"
                                r="50"
                                style={{ strokeDashoffset: offset }}
                            />
                        </svg>
                        <div className="gauge-center">
                            <div className={`gauge-value ${colorClass}`}>{riskScore}%</div>
                            <div className="gauge-label">Risk Score</div>
                        </div>
                    </div>

                    <span className={`risk-badge ${colorClass}`}>
                        {badgeIcon} {category}
                    </span>
                </div>

                {/* Metrics Grid */}
                <div className="metrics-grid">
                    <div className="metric-cell">
                        <span className="metric-label">Probability</span>
                        <span className="metric-value">{(probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-cell">
                        <span className="metric-label">Confidence</span>
                        <span className="metric-value">{confidence}%</span>
                    </div>
                    <div className="metric-cell">
                        <span className="metric-label">Prediction</span>
                        <span className="metric-value">{result?.prediction === 1 ? 'Positive' : 'Negative'}</span>
                    </div>
                    <div className="metric-cell">
                        <span className="metric-label">Model</span>
                        <span className="metric-value">v2.0</span>
                    </div>
                </div>

                {/* Health Score Section */}
                <div className="health-score-section fade-in">
                    <div className="health-score-header">
                        <span className="health-label">Lifestyle Health Score</span>
                        <span className={`health-value ${healthScoreColor}`}>{healthScore} / 100</span>
                    </div>
                    <div className="health-score-track">
                        <div
                            className={`health-score-fill ${healthScoreColor}`}
                            style={{ width: `${healthScore}%` }}
                        ></div>
                    </div>
                    <p className="health-score-desc">
                        Based on your sleep, exercise, diet, and lifestyle habits.
                    </p>
                </div>

                {/* Personalized Recommendation */}
                <div className="recommendation">
                    <span className="recommendation-icon">
                        {colorClass === 'low' ? '💚' : colorClass === 'moderate' ? '⚡' : '🏥'}
                    </span>
                    <div className="recommendation-content">
                        <h4>{category === 'Low Risk' ? 'Keep it up!' : category === 'Moderate Risk' ? 'Action Recommended' : 'Medical Attention Advised'}</h4>
                        <p>
                            {colorClass === 'low' && "Great news! Your cardiac risk profile looks healthy. Maintain your balanced lifestyle, continue regular exercise, and keep your stress in check."}
                            {colorClass === 'moderate' && "Your profile shows moderate risk factors. Focus on improving your exercise routine, eating a heart-healthy diet, and consider a routine cardiac checkup."}
                            {colorClass === 'high' && "Your profile indicates elevated cardiac risk. We strongly recommend consulting a healthcare professional soon for a comprehensive evaluation."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="result-actions">
                <button className="restart-btn" onClick={onRestart}>
                    ← Take Another Assessment
                </button>
            </div>
        </div>
    );
};

export default ResultCard;
