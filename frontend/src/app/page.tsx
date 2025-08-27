'use client';

import { motion } from 'framer-motion';
import { Microscope, ArrowRight, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="inline-flex items-center space-x-3">
              <Microscope className="w-8 h-8 text-lab-primary" />
              <span className="text-xl font-bold text-gray-900">PicNotebook</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/login"
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Mascot/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative">
                {/* Lab Equipment Illustration */}
                <div className="w-80 h-80 relative flex items-center justify-center">
                  {/* Central microscope - simplified */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-blue-100 rounded-full p-12"
                  >
                    <Microscope className="w-40 h-40 text-lab-primary" />
                  </motion.div>
                  
                  {/* Floating elements with text symbols */}
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-8 left-8 text-6xl"
                  >
                    🧪
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute bottom-8 right-8 text-5xl"
                  >
                    📊
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-12 right-6 text-4xl"
                  >
                    📔
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2
                    }}
                    className="absolute bottom-16 left-4 text-3xl"
                  >
                    ⚗️
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                PicNotebook for<br />
                Modern Research Labs
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Organize and manage your research with PicNotebook - the intelligent lab notebook 
                that transforms how scientists document, analyze, and collaborate.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium group"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything Your Lab Needs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From experiment documentation to advanced analytics, PicNotebook provides 
              all the tools modern research teams need to accelerate discovery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-lab-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Documentation</h3>
              <p className="text-gray-600">
                OCR-powered note capture with automatic organization and search capabilities
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center p-6"
            >
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-gray-600">
                Share experiments and insights with your team instantly and securely
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center p-6"
            >
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center text-2xl">
                📈
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Visualize trends and generate insights from your research data automatically
              </p>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/features"
              className="inline-flex items-center text-lab-primary hover:text-blue-700 font-medium group"
            >
              Explore all features
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 mb-8">Trusted by research teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-gray-400 text-lg font-medium">
            <span>University of Michigan</span>
            <span>MIT</span>
            <span>Stanford</span>
            <span>Harvard Medical School</span>
            <span>UC Berkeley</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}