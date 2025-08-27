'use client';

import { motion } from 'framer-motion';
import { Microscope } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center space-x-3">
            <Microscope className="w-8 h-8 text-lab-primary" />
            <span className="text-xl font-bold text-gray-900">PicNotebook</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Thinking Face Illustration */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">🤔</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Features</h1>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-8"></div>
            
            <h2 className="text-2xl text-gray-600 mb-8">Coming soon</h2>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              We're working hard to bring you powerful lab notebook tools that will 
              accelerate your research journey.
            </p>
            
            <div className="space-y-4 mb-12">
              <p className="text-gray-500">Interested in early access? We'd love to hear from you.</p>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">contact@picnotebook.com</p>
                <p className="text-gray-500">Ann Arbor, MI</p>
              </div>
            </div>

            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-lab-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}