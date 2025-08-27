'use client';

import { motion } from 'framer-motion';
import { Microscope, Check } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              One platform for your whole research lab.
              <br />
              Save lots of time and budget.
            </h1>
            
            <div className="mt-8 mb-4">
              <p className="text-gray-600">Trusted by teams at</p>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-gray-400 text-lg mb-12">
              <span>University of Michigan</span>
              <span>MIT</span>
              <span>Stanford</span>
              <span>Harvard</span>
              <span>UC Berkeley</span>
            </div>

            {/* Pricing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button className="px-6 py-2 text-gray-700">Pay monthly</button>
                <button className="px-6 py-2 text-gray-700">Pay yearly</button>
                <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md text-sm">
                  Save up to 20% with yearly
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h3 className="text-2xl font-bold mb-4">Student</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600 ml-2">per member / month</span>
              </div>
              <p className="text-gray-600 mb-6">
                For individual students to organize research projects.
              </p>
              
              <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-8">
                Get started
              </button>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Lab members (up to 3)</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Document storage (1 GB)</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">OCR processing (up to 5)</span>
                </div>
              </div>
            </motion.div>

            {/* Research Lab Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg p-8 shadow-sm border-2 border-blue-500 relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Recommended
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mb-4">Research Lab</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-600 ml-2">per member / month</span>
              </div>
              <p className="text-gray-600 mb-6">
                For growing research labs to scale operations and manage experiments.
              </p>
              
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-8">
                Get started
              </button>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">Everything in Free</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Lab members (up to 15)</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Full experiment management</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Document storage (10 GB)</span>
                </div>
              </div>
            </motion.div>

            {/* University Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h3 className="text-2xl font-bold mb-4">University</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$69</span>
                <span className="text-gray-600 ml-2">per member / month</span>
              </div>
              <p className="text-gray-600 mb-6">
                For large research institutions with advanced security and compliance needs.
              </p>
              
              <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-8">
                Get started
              </button>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">Everything in Research Lab</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Unlimited lab members</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Document storage (100 GB)</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-lab-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}