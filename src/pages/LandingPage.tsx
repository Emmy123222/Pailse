import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Brain, Trophy, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import video from "../asset/MyPaiLES Video.mp4";
import logo from '../asset/logo.png';

const LandingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const fastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const rewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Rocket Icon with Animation */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <Rocket className="h-20 w-20 text-purple-400 animate-bounce z-10" />
              <div className="absolute -inset-4 bg-purple-500/20 rounded-full animate-pulse z-0" />
            </div>
          </div>

          {/* Hero Title - Better Line Breaking */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
            Welcome to My Professional<br className="hidden sm:block" />
            <span className="block mt-2">
              Artificial Intelligence<br className="hidden sm:block" />
              <span className="text-purple-300">Licensing Exam Study</span>
            </span>
            <span className="block mt-2 text-blue-300">(myPaiLES) Platform</span>
          </h1>

          {/* Description - Better Structure */}
          <div className="mb-12 space-y-4">
            <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
              Study for your professional licensing exams with AI-powered preparation
            </p>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                Whether it's your country's or state's <span className="text-purple-300 font-semibold">Bar Exam</span>, 
                <span className="text-blue-300 font-semibold"> Medical Boards</span>, or professional certifications in 
                Insurance, Real Estate, Engineering, Social Work, Pharmacy, Veterinary, Dental, 
                Cosmetology, Electrical, Plumbing, HVAC, Carpentry, Welding, and more.
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-purple-200 font-medium mt-6">
              Your success starts here.
            </p>
          </div>

          {/* Call-to-Action Button */}
          <div className="flex justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition duration-300 transform hover:scale-105 shadow-2xl inline-block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition duration-300 transform hover:scale-105 shadow-2xl inline-block"
              >
                Start Your Journey
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* Why Choose Our Platform Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Why Choose Our Platform?
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              myPaiLES is designed with Artificial Intelligence that learns from user's input and those who successfully pass their state's exams.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Brain,
              title: "Real Study Exam Questions",
              description: "Exam Study Questions are added by you for your exam, which are converted into three types of random timed questions and answers and graded for instant feedback."
            },
            {
              icon: Clock,
              title: "Instant Feedback",
              description: "Practice answering study questions and get instant feedback."
            },
            {
              icon: Trophy,
              title: "Professional Licensing Exam Focus",
              description: "Designed for medical, legal, engineering, trades and other state's professional licensing exams."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <feature.icon className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Three Powerful Study Methods */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Three Powerful Study Methods
          </h3>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              myPaiLES uses Google Translation for global access in multiple languages in three study tools based on your study materials and questions. Based on those who pass their state's licensing exams, AI improves each set of questions to ensure the best outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Video Player Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            See How It Works
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-lg p-4">
            <video
              ref={videoRef}
              src={video}
              className="w-fit h-[400px] rounded flex items-center justify-center mx-auto"
              onClick={togglePlay}
            />
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={rewind}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-all"
                title="Rewind 10s"
              >
                « 10s
              </button>
              <button
                onClick={togglePlay}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={fastForward}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-all"
                title="Fast Forward 10s"
              >
                10s »
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-all"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? 'Exit' : 'Full'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Google Translate Widget Placeholder */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Language Support</h3>
            <p className="text-gray-400 text-sm mb-4">Study in your preferred language</p>
            <div className="bg-purple-600/20 rounded p-3 text-purple-300">
              Google Translate Integration
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-md border-t border-purple-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
             <Link to="/" className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors">
            <div><img src={logo} alt="Logo" className="w-10 h-10" /></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              myPAILES
            </span>
          </Link>
            
            <div className="flex space-x-6">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-purple-400 transition-colors p-2"
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="border-t border-purple-500/20 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 myPAILES. All rights reserved. Empowering professionals to achieve their dreams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;