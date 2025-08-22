import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, RotateCcw, Target, Brain, CheckCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateQuestions, generateFlashcards, Question } from '../lib/groq';

const ExamPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = searchParams.get('mode') || 'flashcards';
  const registrationId = searchParams.get('registration');
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [registration, setRegistration] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);

        if (!registrationId) {
          navigate('/dashboard');
          return;
        }

        // Get registration details
        const { data: regData, error: regError } = await supabase
          .from('exam_registrations')
          .select('*')
          .eq('id', registrationId)
          .eq('user_id', user.id)
          .single();

        if (regError || !regData) {
          navigate('/dashboard');
          return;
        }

        setRegistration(regData);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        navigate('/dashboard');
      }
    };

    initializeSession();
  }, [registrationId, navigate]);

  const startSession = async () => {
    if (!registration) return;

    setLoading(true);
    try {
      if (mode === 'flashcards') {
        const flashcards = await generateFlashcards(
          registration.exam_type,
          registration.exam_category,
          difficulty,
          20
        );
        setQuestions(flashcards);
        setTimeLeft(10); // 10 seconds per card
      } else {
        const examQuestions = await generateQuestions(
          registration.exam_type,
          registration.exam_category,
          difficulty,
          mode === 'multiple_choice' ? 20 : 10
        );
        setQuestions(examQuestions);
        
        if (mode === 'typing') {
          setTimeLeft(300); // 5 minutes for typing mode
        }
      }
      
      setSessionStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setAnswers([]);
      setSessionComplete(false);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (!sessionStarted || sessionComplete || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (mode === 'flashcards') {
            handleNext();
          } else if (mode === 'typing') {
            completeSession();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStarted, sessionComplete, timeLeft, mode]);

  // Auto-advance flashcards
  useEffect(() => {
    if (mode === 'flashcards' && showAnswer && timeLeft <= 5) {
      const timeout = setTimeout(() => {
        handleNext();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [mode, showAnswer, timeLeft]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer('');
      if (mode === 'flashcards') {
        setTimeLeft(10);
      }
    } else {
      completeSession();
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);

    if (mode === 'multiple_choice') {
      const currentQuestion = questions[currentIndex];
      if (answer === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
      
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  };

  const completeSession = async () => {
    setSessionComplete(true);
    
    // Save session to database
    if (user && registration) {
      try {
        await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            exam_registration_id: registration.id,
            mode,
            difficulty,
            score,
            total_questions: questions.length,
            time_spent: mode === 'flashcards' ? questions.length * 10 : 300
          });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading your study session...</p>
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2 capitalize">
                {mode.replace('_', ' ')} Mode
              </h1>
              <p className="text-gray-400">
                {mode === 'flashcards' && 'Quick review with AI-generated flashcards'}
                {mode === 'multiple_choice' && 'Practice with realistic exam questions'}
                {mode === 'typing' && 'Timed open-ended questions'}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Select Difficulty Level:
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                    className={`p-4 rounded-lg border transition-all capitalize ${
                      difficulty === level
                        ? 'border-purple-400 bg-purple-500/20 text-white'
                        : 'border-purple-500/30 bg-black/20 text-gray-300 hover:border-purple-400/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-white mb-4">Session Complete!</h1>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-purple-500/20 rounded-xl p-4">
                <p className="text-purple-300 text-sm">Score</p>
                <p className="text-3xl font-bold text-white">{score}/{questions.length}</p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm">Percentage</p>
                <p className="text-3xl font-bold text-white">{percentage}%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startSession}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              
              <Link
                to="/dashboard"
                className="flex items-center justify-center space-x-2 bg-black/40 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Exit Session</span>
          </Link>
          
          <div className="flex items-center space-x-4 text-white">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span>{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/40 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Content */}
        <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8">
          {mode === 'flashcards' ? (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {showAnswer ? 'Answer' : 'Question'}
                </h2>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
                  <p className="text-xl text-white">
                    {showAnswer ? currentQuestion.answer : currentQuestion.question}
                  </p>
                </div>
              </div>
              
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Show Answer
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400">Next card in {timeLeft - 5} seconds...</p>
                  <button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Next Card
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'multiple_choice' ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-4">
                {currentQuestion.options?.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option[0])}
                    disabled={selectedAnswer !== ''}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedAnswer === '' 
                        ? 'border-purple-500/30 bg-black/20 hover:border-purple-400/50 text-white'
                        : selectedAnswer === option[0]
                        ? option[0] === currentQuestion.correctAnswer
                          ? 'border-green-400 bg-green-500/20 text-green-300'
                          : 'border-red-400 bg-red-500/20 text-red-300'
                        : option[0] === currentQuestion.correctAnswer
                        ? 'border-green-400 bg-green-500/20 text-green-300'
                        : 'border-purple-500/30 bg-black/20 text-gray-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selectedAnswer && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 font-semibold mb-2">Explanation:</p>
                  <p className="text-white">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {currentQuestion.question}
              </h2>
              
              <textarea
                placeholder="Type your answer here..."
                className="w-full h-40 p-4 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                value={answers[currentIndex] || ''}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[currentIndex] = e.target.value;
                  setAnswers(newAnswers);
                }}
              ></textarea>
              
              <div className="flex justify-between mt-6">
                <div className="text-gray-400">
                  Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;