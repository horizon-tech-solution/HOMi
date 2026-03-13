import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-8">

        {/* Row 1 — Company */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm mb-6">
          <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">About Us</Link>
          <Link to="/how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">How It Works</Link>
          <Link to="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">Blog</Link>
          <Link to="/careers" className="text-gray-700 hover:text-primary-600 transition-colors">Careers</Link>
          <Link to="/press" className="text-gray-700 hover:text-primary-600 transition-colors">Press</Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact Us</Link>
        </div>

        {/* Row 2 — For Users */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm mb-6">
          <Link to="/search" className="text-gray-700 hover:text-primary-600 transition-colors">Find Property</Link>
          <Link to="/agents" className="text-gray-700 hover:text-primary-600 transition-colors">Browse Agents</Link>
          <Link to="/user/sell/list-property" className="text-gray-700 hover:text-primary-600 transition-colors">List a Property</Link>
          <Link to="/agent-signup" className="text-gray-700 hover:text-primary-600 transition-colors">Become a Verified Agent</Link>
          <Link to="/diaspora" className="text-gray-700 hover:text-primary-600 transition-colors">Diaspora Investor Services</Link>
          <Link to="/virtual-tours" className="text-gray-700 hover:text-primary-600 transition-colors">Virtual Tours</Link>
        </div>

        {/* Row 3 — Resources */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm mb-8">
          <Link to="/help" className="text-gray-700 hover:text-primary-600 transition-colors">Help Center</Link>
          <Link to="/market-insights" className="text-gray-700 hover:text-primary-600 transition-colors">Market Insights</Link>
          <Link to="/buying-guide" className="text-gray-700 hover:text-primary-600 transition-colors">Buying Guide</Link>
          <Link to="/renting-guide" className="text-gray-700 hover:text-primary-600 transition-colors">Renting Guide</Link>
          <Link to="/fraud-prevention" className="text-gray-700 hover:text-primary-600 transition-colors">Fraud Prevention Tips</Link>
          <Link to="/report" className="text-gray-700 hover:text-primary-600 transition-colors">Report a Listing</Link>
        </div>

        {/* Privacy */}
        <div className="text-center mb-8">
          <Link to="/data-request" className="text-sm text-primary-600 hover:underline">
            Request or Delete My Personal Data →
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-200 pt-8 pb-6">
          <div className="text-xs text-gray-600 leading-relaxed space-y-4 max-w-5xl mx-auto text-center">
            <p>
              HOMi is committed to making property search safe and accessible for everyone in Cameroon and the diaspora. We manually verify every agent and listing before it goes live. If you encounter a suspicious listing, please{' '}
              <Link to="/report" className="text-primary-600 hover:underline">report it here</Link>.
            </p>

            <p>
              HOMi operates as a property marketplace and does not act as a real estate broker, agent, or legal representative. All transactions are conducted between users and verified agents. HOMi is not a party to any lease, sale, or purchase agreement.
            </p>

            <p>
              Escrow and documentation services are facilitated through licensed third-party partners. HOMi does not hold client funds directly.
            </p>

            <p>
              Property prices displayed are estimates provided by listing agents and may vary. All prices shown in XAF unless otherwise specified. Multi-currency display (USD, EUR) is for reference only.
            </p>

            <p>
              <Link to="/terms" className="text-primary-600 hover:underline">Terms of Use</Link>
              {' · '}
              <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
              {' · '}
              <Link to="/cookie-policy" className="text-primary-600 hover:underline">Cookie Policy</Link>
              {' · '}
              <Link to="/agent-code-of-conduct" className="text-primary-600 hover:underline">Agent Code of Conduct</Link>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold hover:text-primary-700 transition-colors">
              <span className="hidden sm:block text-xl font-bolder text-gray-900">
                HOM<span className='text-pink-600'>i</span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Follow us:</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            © {currentYear} HOMi · Made for Cameroon 🇨🇲
          </div>
        </div>
      </div>

      {/* Building Illustration */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/footer-art.png"
          alt="City buildings illustration"
          className="w-full h-auto object-cover object-center"
        />
      </div>
    </footer>
  );
};

export default Footer;