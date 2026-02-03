import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Links - Horizontal Layout */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm mb-6">
          <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">About</Link>
          <Link to="/testimonials" className="text-gray-700 hover:text-primary-600 transition-colors">Testimonials</Link>
          <Link to="/research" className="text-gray-700 hover:text-primary-600 transition-colors">Research</Link>
          <Link to="/careers" className="text-gray-700 hover:text-primary-600 transition-colors">Careers</Link>
          <Link to="/applicant-privacy" className="text-gray-700 hover:text-primary-600 transition-colors">Applicant Privacy Notice</Link>
          <Link to="/help" className="text-gray-700 hover:text-primary-600 transition-colors">Help</Link>
          <Link to="/advertise" className="text-gray-700 hover:text-primary-600 transition-colors">Advertise</Link>
          <Link to="/fair-housing" className="text-gray-700 hover:text-primary-600 transition-colors">Fair Housing Guide</Link>
          <Link to="/advocacy" className="text-gray-700 hover:text-primary-600 transition-colors">Advocacy</Link>
          <Link to="/terms" className="text-gray-700 hover:text-primary-600 transition-colors">Terms of use</Link>
          <Link to="/privacy-notice" className="text-gray-700 hover:text-primary-600 transition-colors">Privacy Notice</Link>
          <Link to="/ad-choices" className="text-gray-700 hover:text-primary-600 transition-colors">Ad Choices</Link>
        </div>

        {/* Second Row of Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm mb-6">
          <Link to="/cookie-preference" className="text-gray-700 hover:text-primary-600 transition-colors">Cookie Preference</Link>
          <Link to="/learn" className="text-gray-700 hover:text-primary-600 transition-colors">Learn</Link>
          <Link to="/ai" className="text-gray-700 hover:text-primary-600 transition-colors">AI</Link>
          <Link to="/mobile-apps" className="text-gray-700 hover:text-primary-600 transition-colors">Mobile Apps</Link>
        </div>

        {/* Third Row of Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm mb-8">
          <Link to="/trulia" className="text-gray-700 hover:text-primary-600 transition-colors">Trulia</Link>
          <Link to="/streeteasy" className="text-gray-700 hover:text-primary-600 transition-colors">StreetEasy</Link>
          <Link to="/hotpads" className="text-gray-700 hover:text-primary-600 transition-colors">HotPads</Link>
          <Link to="/out-east" className="text-gray-700 hover:text-primary-600 transition-colors">Out East</Link>
        </div>

        {/* Privacy Link with Arrow */}
        <div className="text-center mb-8">
          <Link to="/do-not-sell" className="text-sm text-primary-600 hover:underline">
            Do Not Sell or Share My Personal Information→
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-200 pt-8 pb-6">
          <div className="text-xs text-gray-600 leading-relaxed space-y-4 max-w-5xl mx-auto text-center">
            <p>
              PropertyPlatform Group is committed to ensuring digital accessibility for individuals with disabilities. We are continuously working to improve the accessibility of our web experience for everyone, and we welcome feedback and accommodation requests. If you wish to report an issue or seek an accommodation, please{' '}
              <Link to="/contact" className="text-primary-600 hover:underline">let us know</Link>.
            </p>
            
            <p>
              PropertyPlatform, Inc. holds real estate brokerage{' '}
              <Link to="/licenses" className="text-primary-600 hover:underline">licenses</Link>
              {' '}in multiple states. PropertyPlatform (Cameroon), Inc. holds real estate brokerage{' '}
              <Link to="/licenses" className="text-primary-600 hover:underline">licenses</Link>
              {' '}in multiple provinces.
            </p>

            <p>
              This site is not authorized by the New York State Department of Finance Services. No mortgage solicitation activity or loan applications for properties located in the state of New York can be facilitated through this site. All mortgage lending products and information provided by PropertyPlatform Home Loans, LLC.
            </p>

            <p>
              NMLS #10287.{' '}
              <Link to="/nmls-consumer-access" className="text-primary-600 hover:underline">NMLS Consumer Access</Link>
            </p>

            <p>
              <Link to="/operating-procedures" className="text-primary-600 hover:underline">§ 442-H New York Standard Operating Procedures</Link>
            </p>

            <p>
              <Link to="/fair-housing-notice" className="text-primary-600 hover:underline">§ New York Fair Housing Notice</Link>
            </p>

            <p>
              TREC:{' '}
              <Link to="/trec-info" className="text-primary-600 hover:underline">Information about brokerage services</Link>
              {', '}
              <Link to="/consumer-protection" className="text-primary-600 hover:underline">Consumer protection notice</Link>
            </p>

            <p>
              California DRE #1522444
            </p>

            <p className="font-medium">
              <Link to="/contact-brokerage" className="text-primary-600 hover:underline">Contact PropertyPlatform, Inc. Brokerage</Link>
            </p>

            <p>
              For listings in Canada, the trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by The Canadian Real Estate Association (CREA) and identify real estate professionals who are members of CREA. The trademarks MLS®, Multiple Listing Service® and the associated logos are owned by CREA and identify the quality of services provided by real estate professionals who are members of CREA. Used under license.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-200">
          {/* Logo and Social */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold  hover:text-primary-700 transition-colors">
              <span className="hidden sm:block text-xl font-bolder text-gray-900">
                HOM<span className='text-pink-600'>i</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Follow us:</span>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} PropertyPlatform
          </div>
        </div>
      </div>

      {/* Building Illustration Image */}
      <div className="relative w-full overflow-hidden">
        <img 
          src="/footer-art.svg" 
          alt="City buildings illustration" 
          className="w-full h-auto object-cover object-center"
          style={{ maxHeight: '200px' }}
        />
      </div>
    </footer>
  );
};

export default Footer;