'use client';

import { motion } from 'framer-motion';
import { Microscope, MapPin, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function CareersPage() {
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
              Join Our Mission to Transform Research
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of lab notebooks and research collaboration. 
              Join our team in Ann Arbor, MI and help researchers worldwide accelerate discovery.
            </p>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Open Positions</h2>
            
            <div className="space-y-6">
              {/* Frontend Engineer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Frontend Engineer</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Full-time
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Build intuitive interfaces for researchers using Next.js, TypeScript, and modern web technologies.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Ann Arbor, MI / Remote
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Full-time
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Engineering
                  </div>
                </div>
                <button className="bg-lab-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>

              {/* Backend Engineer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Backend Engineer</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Full-time
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Design scalable APIs and data processing systems using Python, Flask, and cloud technologies.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Ann Arbor, MI / Remote
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Full-time
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Engineering
                  </div>
                </div>
                <button className="bg-lab-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>

              {/* Product Designer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Product Designer</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Full-time
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Create beautiful, user-centered designs that make complex research workflows intuitive and efficient.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Ann Arbor, MI / Remote
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Full-time
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Design
                  </div>
                </div>
                <button className="bg-lab-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>
            </div>
          </div>

          {/* Why Join Us */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Join PicNotebook?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-lg font-semibold mb-2">Impact Real Research</h3>
                <p className="text-gray-600">
                  Your work directly helps researchers at top universities advance human knowledge.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold mb-2">Cutting-Edge Tech</h3>
                <p className="text-gray-600">
                  Work with the latest technologies in AI, cloud computing, and web development.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold mb-2">Remote-First</h3>
                <p className="text-gray-600">
                  Flexible work arrangements with optional office space in Ann Arbor, MI.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-lg font-semibold mb-2">Innovation Culture</h3>
                <p className="text-gray-600">
                  Encouraged to experiment, learn, and contribute to product direction.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold mb-2">Growth Opportunities</h3>
                <p className="text-gray-600">
                  Professional development budget and mentorship from industry veterans.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Mission-Driven</h3>
                <p className="text-gray-600">
                  Join a team passionate about accelerating scientific discovery.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't See a Perfect Match?
            </h2>
            <p className="text-gray-600 mb-6">
              We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-xl font-semibold text-gray-900">careers@picnotebook.com</p>
              <p className="text-gray-500">Ann Arbor, MI</p>
            </div>
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