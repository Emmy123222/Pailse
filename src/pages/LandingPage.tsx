import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Brain, Trophy, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import video from "../asset/MyPaiLES Video.mp4";

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
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Rocket className="h-20 w-20 text-purple-400 animate-bounce" />
              <div className="absolute -inset-4 bg-purple-500/20 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Master Your Professional License Exam
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered study platform designed to help you pass your licensing exam on the first try. 
            Join thousands of successful professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Start Your Journey
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Why Choose myPAILES?
          </h2>
          <p className="text-xl text-gray-400">Advanced AI technology meets proven exam strategies</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered Learning",
              description: "Personalized study plans powered by advanced AI that adapts to your learning style and progress."
            },
            {
              icon: Trophy,
              title: "Proven Success Rate",
              description: "Join thousands of professionals who passed their exams using our comprehensive study platform."
            },
            {
              icon: Clock,
              title: "Flexible Study Modes",
              description: "Multiple study modes including flashcards, multiple choice, and timed practice exams."
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
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <Rocket className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                myPAILES
              </span>
            </div>
            
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