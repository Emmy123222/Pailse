import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, GraduationCap, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { examCategories, usStates } from '../data/examCategories';

interface StudentInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  educationLevel: string;
}

const ExamRegistrationPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [examCategory, setExamCategory] = useState('');
  const [examType, setExamType] = useState('');
  const [state, setState] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    educationLevel: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      setStudentInfo(prev => ({ ...prev, email: user.email || '' }));
    };
    getUser();
  }, [navigate]);

  const selectedCategory = examCategories.find(cat => cat.id === examCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('exam_registrations')
        .insert({
          user_id: user.id,
          exam_category: examCategory,
          exam_type: examType,
          state,
          exam_date: examDate,
          student_info: studentInfo,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to Stripe payment
      window.location.href = 'https://buy.stripe.com/test_6oUdR83Kl9Bm85lfGw5EY00';
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error saving registration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
            Exam Registration
          </h1>
          <p className="text-gray-400">Complete your registration to start studying with AI-powered tools</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Exam Selection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">Exam Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exam Category *
                  </label>
                  <select
                    value={examCategory}
                    onChange={(e) => {
                      setExamCategory(e.target.value);
                      setExamType('');
                    }}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    {examCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exam Type *
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                    disabled={!selectedCategory}
                  >
                    <option value="">Select exam type</option>
                    {selectedCategory?.exams.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  >
                    <option value="">Select your state</option>
                    {usStates.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exam Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/20 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">Student Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={studentInfo.firstName}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={studentInfo.lastName}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={studentInfo.email}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={studentInfo.phone}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={studentInfo.address}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={studentInfo.city}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State *
                  </label>
                  <select
                    value={studentInfo.state}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  >
                    <option value="">Select your state</option>
                    {usStates.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={studentInfo.zipCode}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Education Level *
                  </label>
                  <select
                    value={studentInfo.educationLevel}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, educationLevel: e.target.value }))}
                    className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    required
                  >
                    <option value="">Select education level</option>
                    <option value="High School">High School</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Professional Degree">Professional Degree</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <CreditCard className="h-5 w-5" />
                <span>{loading ? 'Processing...' : 'Continue to Payment ($150)'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamRegistrationPage;