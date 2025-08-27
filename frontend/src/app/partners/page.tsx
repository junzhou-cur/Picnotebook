'use client';

import { motion } from 'framer-motion';
import { Microscope, ExternalLink, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function PartnersPage() {
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
              Partner with PicNotebook
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our ecosystem of research institutions, technology providers, and innovation partners 
              who are shaping the future of scientific collaboration.
            </p>
          </div>

          {/* Partner Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Research Institutions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Institutions</h2>
              <p className="text-gray-600 mb-6">
                We partner with leading universities and research centers to provide 
                tailored solutions for their unique research workflows.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Custom deployment and integration support</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Dedicated training and onboarding programs</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Priority feature development aligned with research needs</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Co-branded solutions and case study opportunities</span>
                </div>
              </div>

              <button className="bg-lab-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Become an Institutional Partner
              </button>
            </motion.div>

            {/* Technology Partners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology Partners</h2>
              <p className="text-gray-600 mb-6">
                Integrate your tools and instruments with PicNotebook to create 
                seamless workflows for researchers worldwide.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">API integration and technical documentation</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Joint go-to-market strategies</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Co-developed features and solutions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Revenue sharing opportunities</span>
                </div>
              </div>

              <button className="bg-lab-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Explore Technology Integration
              </button>
            </motion.div>
          </div>

          {/* Current Partners */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Trusted by Leading Institutions</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center text-gray-500 font-semibold text-lg"
              >
                University of Michigan
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center text-gray-500 font-semibold text-lg"
              >
                MIT
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center text-gray-500 font-semibold text-lg"
              >
                Stanford
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center text-gray-500 font-semibold text-lg"
              >
                Harvard
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center text-gray-500 font-semibold text-lg"
              >
                UC Berkeley
              </motion.div>
            </div>
          </div>

          {/* Partnership Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Partnership Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
                <p className="text-gray-600 text-sm">
                  Work directly with our team to shape product development
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-lg font-semibold mb-2">Growth</h3>
                <p className="text-gray-600 text-sm">
                  Expand your reach in the research community
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold mb-2">Support</h3>
                <p className="text-gray-600 text-sm">
                  Dedicated technical and business support
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Impact</h3>
                <p className="text-gray-600 text-sm">
                  Make a meaningful impact on scientific research
                </p>
              </motion.div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Partner with Us?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Whether you're a research institution looking to enhance your capabilities or 
              a technology provider wanting to reach more researchers, we'd love to explore how we can work together.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-xl font-semibold text-gray-900">partnerships@picnotebook.com</p>
              <p className="text-gray-500">Ann Arbor, MI</p>
            </div>
            <div className="space-x-4">
              <button className="bg-lab-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Start Partnership Discussion
              </button>
              <Link 
                href="/login"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}