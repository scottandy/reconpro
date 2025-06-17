import React, { useState } from 'react';
import { Car, Users, BarChart3, Shield, CheckCircle, ArrowRight, Building2, Zap, Globe, Star } from 'lucide-react';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin, onShowRegister }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'pricing' | 'testimonials'>('features');

  const features = [
    {
      icon: Car,
      title: 'Vehicle Management',
      description: 'Complete vehicle lifecycle tracking from acquisition to sale with detailed inspection workflows.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Multi-user access with role-based permissions and real-time team communication.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics to optimize your reconditioning process.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with data isolation and compliance features.'
    },
    {
      icon: Building2,
      title: 'Multi-Location',
      description: 'Manage multiple dealership locations from a single unified platform.'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Instant synchronization across all devices and team members.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '$99',
      period: '/month',
      description: 'Perfect for small dealerships',
      features: [
        '1 user',
        'Basic vehicle management',
        'Standard reporting',
        'Email support',
        'Single location'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '$299',
      period: '/month',
      description: 'Most popular for growing dealerships',
      features: [
        'Up to 10 users',
        'Advanced analytics',
        'Custom reports',
        'Priority support',
        'Multiple locations',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large dealership groups',
      features: [
        'Unlimited users',
        'White-label solution',
        'Custom integrations',
        'Dedicated support',
        'Advanced security',
        'Custom features'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'John Smith',
      title: 'General Manager',
      company: 'Premier Auto Group',
      content: 'This system has revolutionized our reconditioning process. We\'ve reduced turnaround time by 40% and improved quality control significantly.',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      title: 'Operations Director',
      company: 'Metro Motors',
      content: 'The analytics features give us insights we never had before. We can now predict bottlenecks and optimize our workflow proactively.',
      rating: 5
    },
    {
      name: 'Mike Wilson',
      title: 'Service Manager',
      company: 'City Auto Center',
      content: 'Our technicians love the mobile-friendly interface. They can update vehicle status right from the shop floor.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">ReconPro</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Enterprise Dealership Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onShowLogin}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onShowRegister}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Dealership</span>
            <br />Reconditioning Process
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The complete enterprise solution for managing vehicle reconditioning, team collaboration, and analytics across multiple dealership locations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShowRegister}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
            <button
              onClick={onShowLogin}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/70 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-lg border border-gray-200 shadow-lg"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-white/20">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'features'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'pricing'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'testimonials'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Testimonials
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'features' && (
            <div>
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Everything You Need to Manage Your Dealership
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Comprehensive tools designed specifically for automotive dealership operations
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div>
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Simple, Transparent Pricing
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose the plan that fits your dealership size and needs
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => (
                  <div key={index} className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/20'
                  }`}>
                    {plan.popular && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                        Most Popular
                      </div>
                    )}
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={onShowRegister}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div>
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Trusted by Leading Dealerships
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  See what our customers have to say about their experience
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                      <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Dealership?
          </h3>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of dealerships already using ReconPro to streamline their operations
          </p>
          <button
            onClick={onShowRegister}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg shadow-xl"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">ReconPro</span>
              </div>
              <p className="text-gray-400">
                The leading enterprise solution for dealership reconditioning management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ReconPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;