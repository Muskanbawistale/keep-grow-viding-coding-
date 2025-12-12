
import React, { useState } from 'react';
import { ASSESSMENT_QUESTIONS } from '../constants';
import { generateAssessmentAnalysis } from '../services/geminiService';
import { AssessmentResult } from '../types';

interface AssessmentProps {
  onComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

const Assessment: React.FC<AssessmentProps> = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const QUESTIONS_PER_PAGE = 7;
  const totalPages = Math.ceil(ASSESSMENT_QUESTIONS.length / QUESTIONS_PER_PAGE);

  const handleSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getSeverityLabel = (score: number, type: 'depression' | 'anxiety' | 'stress') => {
    // Standard DASS-21 Scoring (Raw Score * 2)
    // Cutoffs based on Lovibond & Lovibond (1995)
    if (type === 'depression') {
      if (score <= 9) return 'Normal';
      if (score <= 13) return 'Mild';
      if (score <= 20) return 'Moderate';
      if (score <= 27) return 'Severe';
      return 'Extremely Severe';
    }
    if (type === 'anxiety') {
      if (score <= 7) return 'Normal';
      if (score <= 9) return 'Mild';
      if (score <= 14) return 'Moderate';
      if (score <= 19) return 'Severe';
      return 'Extremely Severe';
    }
    if (type === 'stress') {
      if (score <= 14) return 'Normal';
      if (score <= 18) return 'Mild';
      if (score <= 25) return 'Moderate';
      if (score <= 33) return 'Severe';
      return 'Extremely Severe';
    }
    return 'Normal';
  };

  const getSimpleExplanation = (level: string) => {
    switch (level) {
        case 'Normal': return "Within the normal range.";
        case 'Mild': return "Slightly elevated symptoms.";
        case 'Moderate': return "Noticeable symptoms affecting you.";
        case 'Severe': return "Significant impact on your daily life.";
        case 'Extremely Severe': return "Critical level of distress.";
        default: return "";
    }
  };

  const calculateResults = async () => {
    setIsSubmitting(true);
    
    let rawDepression = 0;
    let rawAnxiety = 0;
    let rawStress = 0;

    ASSESSMENT_QUESTIONS.forEach(q => {
        const val = answers[q.id] || 0;
        if (q.category === 'depression') rawDepression += val;
        if (q.category === 'anxiety') rawAnxiety += val;
        if (q.category === 'stress') rawStress += val;
    });

    // DASS-21 requires multiplying raw sums by 2
    const depressionScore = rawDepression * 2;
    const anxietyScore = rawAnxiety * 2;
    const stressScore = rawStress * 2;

    const dLevel = getSeverityLabel(depressionScore, 'depression');
    const aLevel = getSeverityLabel(anxietyScore, 'anxiety');
    const sLevel = getSeverityLabel(stressScore, 'stress');

    const totalScore = depressionScore + anxietyScore + stressScore;

    // Call AI for the text analysis
    const aiData = await generateAssessmentAnalysis(
        { depression: depressionScore, anxiety: anxietyScore, stress: stressScore },
        { depression: dLevel, anxiety: aLevel, stress: sLevel }
    );

    const assessmentResult: AssessmentResult = {
        date: new Date().toLocaleDateString(),
        score: totalScore,
        label: [dLevel, aLevel, sLevel].find(l => l.includes('Severe')) || [dLevel, aLevel, sLevel].find(l => l.includes('Moderate')) || "Healthy",
        summary: aiData.overallSummary,
        breakdown: {
            depression: { score: depressionScore, level: dLevel, explanation: getSimpleExplanation(dLevel) },
            anxiety: { score: anxietyScore, level: aLevel, explanation: getSimpleExplanation(aLevel) },
            stress: { score: stressScore, level: sLevel, explanation: getSimpleExplanation(sLevel) }
        },
        aiAnalysis: aiData
    };

    setResult(assessmentResult);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      calculateResults();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (result) {
    // Result Board View
    const { breakdown, aiAnalysis } = result;
    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Your Wellness Snapshot</h2>
                <p className="text-slate-500 dark:text-slate-400">Analysis based on standard DASS-21 scoring.</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { title: 'Depression', data: breakdown.depression, color: 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' },
                    { title: 'Anxiety', data: breakdown.anxiety, color: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' },
                    { title: 'Stress', data: breakdown.stress, color: 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300' }
                ].map((item) => (
                    <div key={item.title} className={`p-6 rounded-2xl border ${item.color} flex flex-col items-center text-center transition-transform hover:scale-105`}>
                        <h3 className="font-bold uppercase tracking-wider text-xs opacity-70 mb-2">{item.title}</h3>
                        <div className="text-4xl font-bold mb-2">{item.data.score}</div>
                        <div className="text-lg font-bold mb-2">{item.data.level}</div>
                        <p className="text-xs leading-tight opacity-90">{item.data.explanation}</p>
                    </div>
                ))}
            </div>

            {/* AI Analysis Sections */}
            <div className="space-y-6 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                
                {/* Overall Summary */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
                        <span className="text-2xl">📝</span> Overall Summary
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                        {aiAnalysis.overallSummary}
                    </p>
                </div>

                {/* What This Means */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
                        <span className="text-2xl">🤔</span> What This Means For You
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {aiAnalysis.whatThisMeans}
                    </p>
                </div>

                {/* Suggestions */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
                        <span className="text-2xl">🌱</span> Gentle Suggestions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {aiAnalysis.suggestions.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                </div>
                                <p className="text-sm text-emerald-900 dark:text-emerald-200">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Note */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-6">
                    <div className="flex gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 text-sm">
                        <span className="text-2xl">💙</span>
                        <p>{aiAnalysis.supportNote}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => onComplete(result)}
                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                >
                    Save & Finish
                </button>
            </div>
        </div>
    );
  }

  // Question View
  const currentQuestions = ASSESSMENT_QUESTIONS.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );
  
  const progressPercentage = ((currentPage) / totalPages) * 100;
  
  // Check if all questions on current page are answered
  const isCurrentPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">DASS-21 Check-in</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Please read each statement and select how much it applied to you <span className="font-bold text-primary-600 dark:text-primary-400">over the past week</span>.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
           <span>Page {currentPage + 1} of {totalPages}</span>
           <span>{Math.round((Object.keys(answers).length / ASSESSMENT_QUESTIONS.length) * 100)}% Completed</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary-500 transition-all duration-500 ease-out"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
        </div>
      </div>

      <div className="space-y-6">
        {currentQuestions.map((q) => (
          <div key={q.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-500">
            <p className="font-medium text-lg text-slate-800 dark:text-slate-200 mb-4">{q.text}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(q.id, opt.value)}
                  className={`p-3 rounded-lg text-left transition-all border text-sm ${
                    answers[q.id] === opt.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4 justify-between sticky bottom-4 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl">
        <button
            onClick={currentPage === 0 ? onCancel : handlePrev}
            className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
            {currentPage === 0 ? 'Cancel' : 'Back'}
        </button>

        <button
            onClick={handleNext}
            disabled={!isCurrentPageComplete || isSubmitting}
            className="px-8 py-3 rounded-xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
            {isSubmitting ? (
                <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
                </>
            ) : (isLastPage ? 'View Results' : 'Next Step')}
        </button>
      </div>
    </div>
  );
};

export default Assessment;
