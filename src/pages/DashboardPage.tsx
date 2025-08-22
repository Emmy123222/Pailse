import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Calendar, BookOpen, TrendingUp, Clock, 
  Target, Brain, Zap, CheckCircle, AlertCircle, 
  Play, RotateCcw, Rocket 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

interface ExamRegistration {
  id: string;
  exam_category: string;
  exam_type: string;
  state: string;
  exam_date: string;
  student_info: any;
  payment_status: string;
  created_at: string;
}

interface StudySession {
  id: string;
  mode: string;
  difficulty: string;
  score: number;
  total_questions: number;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [registration, setRegistration] = useState<ExamRegistration | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [examResult, setExamResult] = useState<'pass' | 'fail' | ''>('');
  const [agreeToShare, setAgreeToShare] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);

        // Load exam registration with correct query structure
        const { data: regData, error: regError } = await supabase
          .from('exam_registrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (regError) {
          console.error('Registration query error:', regError);
          if (regError.code === '406') {
            console.log('No completed registrations found, redirecting to exam registration');
            navigate('/exam-registration');
            return;
          }
        } else if (regData && regData.length > 0) {
          setRegistration(regData[0]);

          // Load study sessions
          const { data: sessionData, error: sessionError } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('exam_registration_id', regData[0].id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (sessionError) {
            console.error('Study sessions error:', sessionError);
          } else {
            setStudySessions(sessionData || []);
          }
        } else {
          // No completed registration found, redirect to exam registration
          navigate('/exam-registration');
          return;
        }
      } catch (error) {
        console.error('Dashboard loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const isExamDatePassed = () => {
    if (!registration?.exam_date) return false;
    const examDate = new Date(registration.exam_date);
    const today = new Date();
    return today >= examDate;
  };

  const submitExamResult = async () => {
    if (!registration || !examResult || !user) return;

    try {
      const { error } = await supabase
        .from('exam_results')
        .insert({
          user_id: user.id,
          exam_registration_id: registration.id,
          result: examResult,
          agreed_to_share: agreeToShare
        });

      if (error) throw error;
      
      setShowResultModal(false);
      // Reload dashboard data or update UI as needed
      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting result:', error);
      alert('Error submitting result: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8">
              <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No Active Registration</h2>
              <p className="text-gray-400 mb-8">
                You need to complete your exam registration and payment to access the study tools.
              </p>
              <Link
                to="/exam-registration"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Complete Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
            Welcome back, {registration.student_info?.firstName || 'Student'}! 🚀
          </h1>
          <p className="text-gray-400 text-lg">Ready to ace your {registration.exam_type} exam?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Calendar,
              title: 'Exam Date',
              value: new Date(registration.exam_date).toLocaleDateString(),
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Target,
              title: 'Study Sessions',
              value: studySessions.length.toString(),
              color: 'from-purple-500 to-pink-500'
            },
            {
              icon: TrendingUp,
              title: 'Average Score',
              value: studySessions.length > 0 
                ? `${Math.round(studySessions.reduce((acc, session) => acc + (session.score / session.total_questions * 100), 0) / studySessions.length)}%`
                : '0%',
              color: 'from-green-500 to-emerald-500'
            },
            {
              icon: Clock,
              title: 'Days Until Exam',
              value: Math.max(0, Math.ceil((new Date(registration.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))).toString(),
              color: 'from-orange-500 to-red-500'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Study Modes */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Brain className="h-6 w-6 text-purple-400 mr-2" />
                AI Study Modes
              </h2>

              {!isExamDatePassed() ? (
                <div className="grid gap-6">
                  {[
                    {
                      mode: 'flashcards',
                      title: 'Flash Cards Mode',
                      description: 'Quick review with AI-generated flashcards. Perfect for memorization.',
                      icon: Zap,
                      color: 'from-yellow-500 to-orange-500'
                    },
                    {
                      mode: 'multiple_choice',
                      title: 'Multiple Choice Mode',
                      description: 'Practice with realistic exam questions and immediate feedback.',
                      icon: CheckCircle,
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      mode: 'typing',
                      title: 'Typing Mode',
                      description: 'Timed open-ended questions to test your comprehensive knowledge.',
                      icon: Clock,
                      color: 'from-blue-500 to-cyan-500'
                    }
                  ].map((mode) => (
                    <div
                      key={mode.mode}
                      className="border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-all group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${mode.color} group-hover:scale-110 transition-transform`}>
                          <mode.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{mode.title}</h3>
                          <p className="text-gray-400 mb-4">{mode.description}</p>
                          <Link
                            to={`/exam?mode=${mode.mode}&registration=${registration.id}`}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                          >
                            <Play className="h-4 w-4" />
                            <span>Start Session</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Study Tools Inactive</h3>
                  <p className="text-gray-400 mb-6">Your exam date has passed. Please submit your exam result to reactivate tools.</p>
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Submit Exam Result
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exam Info */}
            <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 text-purple-400 mr-2" />
                Exam Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white ml-2">{registration.exam_category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-2">{registration.exam_type}</span>
                </div>
                <div>
                  <span className="text-gray-400">State:</span>
                  <span className="text-white ml-2">{registration.state}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white ml-2">{new Date(registration.exam_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BookOpen className="h-5 w-5 text-purple-400 mr-2" />
                Recent Sessions
              </h3>
              {studySessions.length > 0 ? (
                <div className="space-y-3">
                  {studySessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white capitalize">{session.mode.replace('_', ' ')}</span>
                        <span className="text-gray-400 ml-2">({session.difficulty})</span>
                      </div>
                      <span className="text-purple-400">
                        {session.total_questions > 0 ? Math.round((session.score / session.total_questions) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No study sessions yet. Start your first session!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Submission Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Submit Exam Result</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  How did your exam go?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pass"
                      checked={examResult === 'pass'}
                      onChange={(e) => setExamResult(e.target.value as 'pass' | 'fail')}
                      className="mr-3"
                    />
                    <span className="text-white">I passed! 🎉</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="fail"
                      checked={examResult === 'fail'}
                      onChange={(e) => setExamResult(e.target.value as 'pass' | 'fail')}
                      className="mr-3"
                    />
                    <span className="text-white">I need to retake 📚</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreeToShare}
                    onChange={(e) => setAgreeToShare(e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <span className="text-sm text-gray-300">
                    I agree to share my questions and answers to help improve the AI for future students.
                  </span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitExamResult}
                  disabled={!examResult}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;