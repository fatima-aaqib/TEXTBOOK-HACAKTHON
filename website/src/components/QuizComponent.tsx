import React, { useState } from 'react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (!submitted) {
      setSelectedOption(optionIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
      setSubmitted(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setSubmitted(false);
  };

  return (
    <div className="card margin-bottom--lg" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
      <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          Knowledge Check
        </h3>
      </div>
      <div className="card__body" style={{ padding: '1.5rem' }}>
        {!submitted ? (
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>
              {currentQuestion.question}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {currentQuestion.options.map((option, index) => (
                <label 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: `2px solid ${selectedOption === index ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    backgroundColor: selectedOption === index ? 'var(--ifm-color-emphasis-100)' : 'transparent'
                  }}
                  onClick={() => handleOptionSelect(index)}
                >
                  <input
                    type="radio"
                    name="quiz-option"
                    checked={selectedOption === index}
                    onChange={() => {}}
                    style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <button 
              className="button button--primary"
              onClick={handleSubmit}
              disabled={selectedOption === null}
              style={{ opacity: selectedOption === null ? 0.6 : 1 }}
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1.5rem',
              backgroundColor: selectedOption === currentQuestion.correctAnswer 
                ? 'var(--ifm-color-success-lightest)' 
                : 'var(--ifm-color-danger-lightest)',
              border: `1px solid ${selectedOption === currentQuestion.correctAnswer 
                ? 'var(--ifm-color-success)' 
                : 'var(--ifm-color-danger)'}`
            }}>
              <h4 style={{ 
                margin: 0, 
                color: selectedOption === currentQuestion.correctAnswer 
                  ? 'var(--ifm-color-success-dark)' 
                  : 'var(--ifm-color-danger-dark)',
                fontWeight: '600'
              }}>
                {selectedOption === currentQuestion.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
              </h4>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Explanation:</h5>
              <p style={{ color: 'var(--ifm-color-content-secondary)', lineHeight: '1.6' }}>
                {currentQuestion.explanation}
              </p>
            </div>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button 
                className="button button--primary"
                onClick={handleNext}
              >
                Next Question
              </button>
            ) : (
              <div>
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  marginBottom: '1.5rem',
                  backgroundColor: 'var(--ifm-color-emphasis-100)',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: 0, fontWeight: '600' }}>
                    Quiz Complete! Your Score: {score}/{questions.length}
                  </h4>
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--ifm-color-content-secondary)' }}>
                    {score === questions.length ? 'Perfect! 🎉' : 
                     score >= questions.length / 2 ? 'Good job! 👍' : 
                     'Keep studying! 💪'}
                  </p>
                </div>
                <button 
                  className="button button--primary"
                  onClick={handleRestart}
                >
                  Restart Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;