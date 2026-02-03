import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronDown,
  CheckCircle,
  Home as HomeIcon,
  Eye,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Award,
  Upload,
  Camera,
  FileText,
  MessageCircle
} from 'lucide-react';
import Button from '../../components/Button';

const Sell = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const handleFaqToggle = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleGetStarted = () => {
    navigate('/list-property');
  };

  const faqs = [
    {
      id: 1,
      question: 'How much does it cost to list my property?',
      answer: 'Listing your property on HOMi is completely free! We only charge a small commission (3%) when your property successfully sells or rents. No upfront fees, no hidden charges.'
    },
    {
      id: 2,
      question: 'How long does it take to get my listing live?',
      answer: 'Once you submit your listing, our team reviews it within 24 hours. After approval, your property will be visible to thousands of potential buyers immediately.'
    },
    {
      id: 3,
      question: 'Can I edit my listing after it\'s published?',
      answer: 'Yes! You can edit your listing anytime from your dashboard. Update photos, change the price, or modify the description as needed.'
    },
    {
      id: 4,
      question: 'What happens after I submit my listing?',
      answer: 'After submission, our team verifies your listing details and documents. Once approved, your property goes live and potential buyers can contact you directly through our platform.'
    },
    {
      id: 5,
      question: 'How do buyers contact me?',
      answer: 'Interested buyers can contact you through our messaging system, phone, or WhatsApp. Your contact information remains private until you choose to share it with verified buyers.'
    },
    {
      id: 6,
      question: 'Do I need to be an agent to list a property?',
      answer: 'No! Anyone can list a property on HOMi. Whether you\'re a property owner, landlord, or developer, you can create a listing in minutes.'
    },
    {
      id: 7,
      question: 'What makes a good property listing?',
      answer: 'Great listings have high-quality photos (6+ recommended), accurate details, competitive pricing, and detailed descriptions. Properties with complete information get 3x more inquiries.'
    },
    {
      id: 8,
      question: 'How long does it take to sell a property in Cameroon?',
      answer: 'On average, properties in Douala and Yaoundé sell within 60-90 days. However, well-priced properties with quality photos and complete information can sell in as little as 30 days.'
    }
  ];

  const howItWorks = [
    {
      icon: Upload,
      step: '1',
      title: 'Create Your Listing',
      description: 'Fill in property details, add photos, and set your price. Takes just 5-10 minutes.'
    },
    {
      icon: Eye,
      step: '2',
      title: 'Get Verified',
      description: 'Our team reviews your listing within 24 hours to ensure quality and accuracy.'
    },
    {
      icon: MessageCircle,
      step: '3',
      title: 'Connect with Buyers',
      description: 'Receive inquiries from verified buyers and schedule viewings directly.'
    },
    {
      icon: DollarSign,
      step: '4',
      title: 'Close the Deal',
      description: 'Negotiate, finalize terms, and complete the sale with our support.'
    }
  ];

  const sellingOptions = [
    {
      icon: HomeIcon,
      title: 'List It Yourself',
      description: 'Perfect for property owners who want full control. List your house or land directly and connect with buyers.',
      benefits: ['100% free to list', 'Direct buyer contact', 'Full price control', 'Edit anytime'],
      recommended: 'For individual property owners'
    },
    {
      icon: Users,
      title: 'Work with an Agent',
      description: 'Get professional help from verified agents who handle everything from pricing to closing.',
      benefits: ['Professional guidance', 'Market expertise', 'Faster sales', 'Negotiation support'],
      recommended: 'For busy sellers or complex properties'
    }
  ];

  const whyChooseUs = [
    {
      icon: Eye,
      title: 'Maximum Visibility',
      description: '50,000+ monthly visitors actively searching for properties in Cameroon'
    },
    {
      icon: Shield,
      title: 'Verified Buyers',
      description: 'All buyers are verified to ensure serious inquiries and safe transactions'
    },
    {
      icon: Clock,
      title: 'Quick Approval',
      description: 'Your listing goes live within 24 hours after our quick verification process'
    },
    {
      icon: Award,
      title: 'Professional Support',
      description: 'Dedicated support team to help you throughout your selling journey'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhCNTMzRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                No Agent License Required ✨
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                Sell your house or land with ease
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Whether you're a homeowner, landlord, or developer—list your property in minutes and reach thousands of active buyers across Cameroon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleGetStarted}
                  className="group w-full sm:w-auto"
                >
                  List my property free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/find-agent" className="w-full sm:w-auto">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    Get agent help
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">0%</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Listing Fee</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">24h</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Go Live</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">50K+</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Active Buyers</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop" 
                  alt="Sell your home" 
                  className="w-full h-64 sm:h-80 lg:h-full object-cover"
                />
                {/* Floating Card */}
                <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl max-w-[200px] sm:max-w-none">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 flex items-center justify-center">
                      <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs text-gray-500">Your Property</div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900">Going Live Soon</div>
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-amber-600">45M XAF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
                List your property in 4 easy steps
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                No experience needed. Anyone can list a house or land in minutes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative">
                    {/* Connector line for desktop */}
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-amber-200"></div>
                    )}
                    
                    <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-amber-200 transition-all hover:shadow-lg">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-sm font-black text-amber-600">{item.step}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Selling Options Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-teal-700 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 sm:mb-4">
                Choose how you want to <span className="text-teal-200">sell</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-teal-100 max-w-3xl mx-auto">
                Whether you prefer to do it yourself or get professional help—we've got you covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-12">
              {sellingOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 text-gray-900  transition-transform">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-600" />
                      </div>
                      <div className="text-xs sm:text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                        {option.recommended}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">{option.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{option.description}</p>
                    <ul className="space-y-2 sm:space-y-3">
                      {option.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg text-teal-100 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                Not sure which option is right for you? Start by creating a free listing and decide later if you need agent assistance.
              </p>
              <Button 
                variant="secondary"
                size="lg"
                className="bg-white text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
              >
               <Link to="/user/sell/add-property">
                    Get started for free
               </Link> 
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
                Why sellers choose HOMi
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of successful property sellers across Cameroon
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-600" />
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
                Frequently asked questions
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Everything you need to know about selling your property
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {faqs.map(faq => (
                <div 
                  key={faq.id} 
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-amber-300 transition-colors"
                >
                  <button
                    onClick={() => handleFaqToggle(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:py-5 sm:px-6 text-left focus:outline-none group bg-white hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 pr-4 group-hover:text-amber-600 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0 transition-transform ${
                        activeFaq === faq.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {activeFaq === faq.id && (
                    <div className="px-4 pb-4 sm:px-6 sm:pb-5 bg-amber-50 animate-slideDown">
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl lg:rounded-3xl p-6 sm:p-10 lg:p-16 border-2 border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-amber-200 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
              
              <div className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                      Find your perfect selling path in minutes
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                      Answer a few simple questions to determine whether selling with a partner agent or getting a cash offer is best for you. No commitment required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={handleGetStarted}
                        className="group w-full sm:w-auto"
                      >
                        Explore selling options
                      </Button>
                      <Link to="/find-agent" className="w-full sm:w-auto">
                        <Button 
                          variant="secondary"
                          size="lg"
                          className="w-full"
                        >
                          Talk to an agent
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Illustration */}
                  <div className="flex justify-center lg:justify-end mt-6 lg:mt-0">
                    <img 
                      src="/motion1.png" 
                      alt="Selling illustration" 
                      className="w-full max-w-[280px] sm:max-w-xs lg:max-w-sm h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
              <div className="bg-white rounded-xl p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 mb-1 sm:mb-2">3,500+</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Properties Sold</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 mb-1 sm:mb-2">24hrs</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Avg. Response Time</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 mb-1 sm:mb-2">98%</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 mb-1 sm:mb-2">50K+</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Active Buyers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Sell;