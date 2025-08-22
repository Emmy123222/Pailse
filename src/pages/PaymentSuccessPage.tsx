import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Rocket, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Find the user's pending registration and mark it as completed
        const { data: registration, error } = await supabase
          .from('exam_registrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (registration) {
          const { error: updateError } = await supabase
            .from('exam_registrations')
            .update({ 
              payment_status: 'completed',
              payment_id: searchParams.get('session_id') || 'stripe_payment'
            })
            .eq('id', registration.id);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
          } else {
            setUpdated(true);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    updatePaymentStatus();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-400 animate-pulse" />
              <div className="absolute -inset-4 bg-green-400/20 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            🎉 Welcome to myPAILES! Your exam preparation journey starts now.
          </p>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-300 mb-2">What's Next?</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li>• Access AI-powered study tools</li>
              <li>• Take practice exams in multiple modes</li>
              <li>• Track your progress and performance</li>
              <li>• Get personalized study recommendations</li>
            </ul>
          </div>

          {updated && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
              <p className="text-purple-300">
                ✅ Your account has been activated successfully
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Rocket className="h-5 w-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 bg-black/40 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Payment Details */}
          <div className="mt-8 pt-6 border-t border-purple-500/20">
            <p className="text-gray-400 text-sm">
              Receipt and access details have been sent to your email.
              <br />
              Questions? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;