import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Building2, ArrowRight, Home as HomeIcon,
  TrendingUp, Clock, Star, ChevronLeft, ChevronRight,
  CheckCircle, Shield, Users, MessageCircle, Phone, Zap, Lock,
  ChevronDown, ThumbsUp, Quote
} from 'lucide-react';
import Button from '../../components/Button';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';

import buyHomeIcon         from '../../assets/images/buy-home.svg';
import rentHomeIcon        from '../../assets/images/rent-home.svg';
import sellHomeIcon        from '../../assets/images/sell-home.svg';
import heroAccentIcon      from '../../assets/images/hero-accent.svg';
import emptyStateIcon      from '../../assets/images/empty-state.svg';
import searchIllustration  from '../../assets/images/search-illustration.svg';
import connectIllustration from '../../assets/images/connect-illustration.svg';
import moveInIllustration  from '../../assets/images/move-in-illustration.svg';
import trustBadgeIcon      from '../../assets/images/trust-badge.svg';
import verifiedIcon        from '../../assets/images/verified-icon.svg';
import supportIcon         from '../../assets/images/support-icon.svg';

const CITIES = [
  { id: 'douala',  name: 'Douala'  },
  { id: 'yaounde', name: 'Yaoundé' },
];

const MOCK_FEATURED_LISTINGS = [
  { id:1, title:'Modern 3BR Apartment in Bonanjo',   price:75000,  location:'Bonanjo, Douala',     address:'Bonanjo, Douala',     bedrooms:3, bathrooms:2, area:120, type:'For Rent', listingType:'For Rent', image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop', images:['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'], isFavorited:false },
  { id:2, title:'Luxury Villa with Swimming Pool',    price:250000, location:'Bastos, Yaoundé',      address:'Bastos, Yaoundé',      bedrooms:5, bathrooms:4, area:350, type:'For Sale', listingType:'For Sale', image:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop', images:['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop'], isFavorited:false },
  { id:3, title:'Cozy Studio Apartment',              price:35000,  location:'Akwa, Douala',         address:'Akwa, Douala',         bedrooms:1, bathrooms:1, area:45,  type:'For Rent', listingType:'For Rent', image:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop', images:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'], isFavorited:false },
  { id:4, title:'Spacious 4BR Family House',          price:180000, location:'Bepanda, Douala',      address:'Bepanda, Douala',      bedrooms:4, bathrooms:3, area:200, type:'For Sale', listingType:'For Sale', image:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop', images:['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'], isFavorited:false },
  { id:5, title:'Commercial Space in City Center',    price:120000, location:'Centre Ville, Douala', address:'Centre Ville, Douala', bedrooms:0, bathrooms:2, area:150, type:'For Rent', listingType:'For Rent', image:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop', images:['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'], isFavorited:false },
  { id:6, title:'Elegant 2BR Apartment with Garden',  price:65000,  location:'Nlongkak, Yaoundé',    address:'Nlongkak, Yaoundé',    bedrooms:2, bathrooms:2, area:95,  type:'For Rent', listingType:'For Rent', image:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', images:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop'], isFavorited:false },
];

const NEIGHBORHOODS = [
  { name:'Bonanjo',    city:'Douala',  listings:48, image:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',   tag:'Business Hub' },
  { name:'Bastos',     city:'Yaoundé', listings:32, image:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',   tag:'Luxury'       },
  { name:'Akwa',       city:'Douala',  listings:61, image:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',       tag:'Commercial'   },
  { name:'Nlongkak',   city:'Yaoundé', listings:27, image:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',   tag:'Residential'  },
  { name:'Deido',      city:'Douala',  listings:39, image:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',   tag:'Family'       },
  { name:'Biyem-Assi', city:'Yaoundé', listings:44, image:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',  tag:'Affordable'   },
];

const TESTIMONIALS = [
  { name:'Marie Nguema',     role:'First-time Buyer',   city:'Yaoundé', text:"HOMi made finding my first home incredibly easy. The verified listings and direct agent contact saved me weeks of searching. I moved in within a month!", rating:5, avatar:'https://randomuser.me/api/portraits/women/44.jpg' },
  { name:'Jean-Paul Mballa', role:'Property Investor',  city:'Douala',  text:"As an investor I need reliable data. HOMi's market insights and the quality of listings are unmatched in Cameroon. Already closed 3 deals this year.", rating:5, avatar:'https://randomuser.me/api/portraits/men/32.jpg'   },
  { name:'Aminata Diallo',   role:'Renter',             city:'Douala',  text:"Found a beautiful 2-bedroom in Bonanjo at a fair price. No hidden fees, no scams. Highly recommend HOMi!", rating:5, avatar:'https://randomuser.me/api/portraits/women/68.jpg' },
];

const AGENTS = [
  { name:'Paul Ateba',    title:'Senior Agent',      listings:42, sales:128, rating:4.9, city:'Douala',  avatar:'https://randomuser.me/api/portraits/men/45.jpg',   verified:true },
  { name:'Grace Ekweme', title:'Luxury Specialist',  listings:28, sales:89,  rating:4.8, city:'Yaoundé', avatar:'https://randomuser.me/api/portraits/women/33.jpg', verified:true },
  { name:'David Nkomo',  title:'Investment Advisor', listings:35, sales:104, rating:4.9, city:'Douala',  avatar:'https://randomuser.me/api/portraits/men/67.jpg',   verified:true },
];

const useCounter = (target, duration = 2000, active = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start;
    const raf = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration, active]);
  return val;
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchCity, setSearchCity]     = useState('');
  const [searchType, setSearchType]     = useState('');
  const [searchTab, setSearchTab]       = useState('rent');
  const [priceMin, setPriceMin]         = useState('');
  const [priceMax, setPriceMax]         = useState('');
  const [bedrooms, setBedrooms]         = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statsOn, setStatsOn]           = useState(false);
  const [activeTmn, setActiveTmn]       = useState(0);
  const [nCity, setNCity]               = useState('all');
  const [canLeft, setCanLeft]           = useState(false);
  const [canRight, setCanRight]         = useState(true);
  const scrollRef = useRef(null);
  const statsRef  = useRef(null);

  const cListings = useCounter(500,  2000, statsOn);
  const cAgents   = useCounter(120,  2000, statsOn);
  const cSales    = useCounter(1800, 2200, statsOn);
  const cCities   = useCounter(12,   1500, statsOn);

  useEffect(() => { setTimeout(() => { setFeaturedListings(MOCK_FEATURED_LISTINGS); setLoading(false); }, 1000); }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveTmn(p => (p + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 10);
  };
  const scroll = (dir) => scrollRef.current?.scrollTo({ left: scrollRef.current.scrollLeft + (dir === 'left' ? -400 : 400), behavior: 'smooth' });
  useEffect(() => {
    const el = scrollRef.current;
    if (el) { checkScroll(); el.addEventListener('scroll', checkScroll); return () => el.removeEventListener('scroll', checkScroll); }
  }, [featuredListings]);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (searchCity) p.append('city', searchCity);
    if (searchType) p.append('type', searchType);
    if (searchTab)  p.append('listingType', searchTab);
    if (priceMin)   p.append('priceMin', priceMin);
    if (priceMax)   p.append('priceMax', priceMax);
    if (bedrooms)   p.append('bedrooms', bedrooms);
    navigate(`/properties?${p.toString()}`);
  };

  const filteredN = nCity === 'all' ? NEIGHBORHOODS : NEIGHBORHOODS.filter(n => n.city.toLowerCase() === nCity);

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet" />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAF8]">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-amber-50 blur-3xl opacity-70 -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-orange-50 blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-24 pb-16 min-h-screen">
          {/* Left */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold tracking-widest uppercase rounded-full px-4 py-2 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Cameroon's #1 property platform
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.05] mb-5" style={{ fontFamily: "'Fraunces', serif" }}>
              Find Your<br /><em className="text-amber-600 not-italic">Perfect</em> Home<br />in Cameroon
            </h1>
            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-8">
              Browse <strong className="text-gray-700">500+ verified properties</strong> across Douala &amp; Yaoundé. No scams. No hidden fees. Just your next home.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              {[{ icon: Shield, label:'Verified listings' },{ icon: Zap, label:'Instant contact' },{ icon: Lock, label:'Safe payments' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
                  <Icon className="w-4 h-4 text-amber-600" />{label}
                </div>
              ))}
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[{ id:'rent', label:'🏠  Rent' },{ id:'buy', label:'🔑  Buy' },{ id:'sell', label:'💰  Sell' }].map(t => (
                  <button key={t.id} onClick={() => setSearchTab(t.id)}
                    className={`flex-1 py-3.5 text-sm font-bold transition-all ${searchTab === t.id ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-amber-500" />
                    <select value={searchCity} onChange={e => setSearchCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium text-gray-700 bg-gray-50">
                      <option value="">All Cities</option>
                      {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-3.5 w-4 h-4 text-amber-500" />
                    <select value={searchType} onChange={e => setSearchType(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium text-gray-700 bg-gray-50">
                      <option value="">Property Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setShowAdvanced(p => !p)}
                  className="flex items-center gap-1 text-amber-700 text-xs font-bold mb-3 hover:text-amber-900 transition-colors">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  {showAdvanced ? 'Less' : 'More'} filters
                </button>
                {showAdvanced && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input type="number" placeholder="Min (XAF)" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                      className="px-3 py-3 border border-gray-200 rounded-xl focus:border-amber-400 outline-none text-sm text-gray-700 bg-gray-50" />
                    <input type="number" placeholder="Max (XAF)" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                      className="px-3 py-3 border border-gray-200 rounded-xl focus:border-amber-400 outline-none text-sm text-gray-700 bg-gray-50" />
                    <select value={bedrooms} onChange={e => setBedrooms(e.target.value)}
                      className="px-3 py-3 border border-gray-200 rounded-xl focus:border-amber-400 outline-none text-sm text-gray-700 bg-gray-50">
                      <option value="">Beds</option>
                      <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
                    </select>
                  </div>
                )}
                <button onClick={handleSearch}
                  className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-200">
                  <Search className="w-4 h-4" /> Search Properties
                </button>
              </div>
              <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 font-medium">Popular:</span>
                {['Studio Akwa','3BR Bonanjo','Villa Bastos'].map(q => (
                  <button key={q} onClick={() => navigate(`/properties?q=${q}`)}
                    className="text-xs bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-500 rounded-full px-3 py-1 font-semibold transition-colors">{q}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — photo collage */}
          <div className="hidden lg:flex relative h-[620px] items-center justify-center">
            <div className="absolute top-4 right-0 w-48 h-48 opacity-20 pointer-events-none">
              <img src={heroAccentIcon} alt="" className="w-full h-full object-contain animate-float" />
            </div>
            <div className="absolute top-8 right-8 w-72 h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=700&fit=crop&q=90" alt="Home" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-8 left-4 w-56 h-52 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=350&fit=crop&q=80" alt="Home" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-16 left-2 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 w-44">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-bold text-gray-500">New today</span>
              </div>
              <p className="text-2xl font-black text-gray-900">12 <span className="text-sm font-semibold text-gray-400">listings</span></p>
            </div>
            <div className="absolute bottom-28 right-2 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 w-48">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-600">Top rated</span>
              </div>
              <p className="text-sm font-bold text-gray-800">Bastos, Yaoundé</p>
              <p className="text-xs text-gray-400 font-medium">32 verified listings</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-white border-y border-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            {[
              { val: cListings, suffix:'+', label:'Active Listings',  color:'text-amber-600' },
              { val: cAgents,   suffix:'+', label:'Verified Agents',  color:'text-blue-500'  },
              { val: cSales,    suffix:'+', label:'Successful Sales', color:'text-green-500' },
              { val: cCities,   suffix:'',  label:'Cities Covered',   color:'text-purple-500'},
            ].map(({ val, suffix, label, color }) => (
              <div key={label}>
                <div className={`text-4xl md:text-5xl font-black ${color} mb-1`}>{val.toLocaleString()}{suffix}</div>
                <p className="text-sm text-gray-400 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUY / RENT / SELL — your SVGs ──────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">What can we help with?</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>Your next move, sorted</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
            {[
              { img: buyHomeIcon,  title:'Buy a Home',       desc:'Find the perfect property with transparent pricing and expert guidance every step of the way.', cta:'Browse for sale', href:'/properties?listingType=sale', bg:'#FFF7ED', border:'#FED7AA' },
              { img: rentHomeIcon, title:'Rent a Home',      desc:'Browse the largest selection of rental properties and move in with confidence, no scams.',      cta:'Find rentals',    href:'/properties?listingType=rent', bg:'#EFF6FF', border:'#BFDBFE' },
              { img: sellHomeIcon, title:'Sell Your Home',   desc:'List your property and connect with thousands of qualified buyers for the best price.',          cta:'List a property', href:'/become-agent',                bg:'#F0FDF4', border:'#BBF7D0' },
            ].map(({ img, title, desc, cta, href, bg, border }) => (
              <div key={title} className="rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group border-2" style={{ background: bg, borderColor: border }}>
                <div className="w-44 h-44 mb-6 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                  <img src={img} alt={title} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium mb-6 flex-1">{desc}</p>
                <Link to={href} className="w-full">
                  <button className="w-full bg-gray-900 hover:bg-amber-600 text-white rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2">
                    {cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Hand-picked</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>Featured Properties</h2>
            </div>
            <Link to="/properties" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-amber-700 font-bold text-sm group transition-colors">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? <Loader text="Loading properties..." /> : featuredListings.length > 0 ? (
            <div className="relative">
              {canLeft  && <button onClick={() => scroll('left')}  className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-amber-600 hover:text-white transition-all border border-gray-100"><ChevronLeft  className="w-5 h-5" /></button>}
              {canRight && <button onClick={() => scroll('right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-amber-600 hover:text-white transition-all border border-gray-100"><ChevronRight className="w-5 h-5" /></button>}
              <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth:'none', msOverflowStyle:'none', scrollSnapType:'x mandatory' }}>
                {featuredListings.map(l => (
                  <div key={l.id} className="flex-shrink-0 w-[300px] sm:w-[360px]" style={{ scrollSnapAlign:'start' }}>
                    <PropertyCard listing={l} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-64 h-64 mx-auto mb-8 opacity-80">
                <img src={emptyStateIcon} alt="No listings" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">No properties yet</h3>
              <p className="text-gray-400 font-medium mb-7">Check back soon or adjust your filters</p>
              <Link to="/properties"><Button size="lg">Browse All</Button></Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/properties">
              <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-amber-600 text-white rounded-2xl px-8 py-4 font-bold text-sm transition-all hover:shadow-lg">
                Show all 500+ properties <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEIGHBOURHOODS ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-5">
            <div>
              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Explore by area</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>Top Neighbourhoods</h2>
            </div>
            <div className="flex gap-2 bg-white border border-gray-200 rounded-2xl p-1">
              {['all','douala','yaoundé'].map(c => (
                <button key={c} onClick={() => setNCity(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${nCity === c ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredN.map(n => (
              <Link key={n.name} to={`/properties?neighborhood=${n.name}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer bg-gray-100" style={{ aspectRatio:'4/3' }}>
                <img src={n.image} alt={n.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">{n.tag}</span>
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white font-black text-lg leading-tight">{n.name}</h3>
                  <p className="text-gray-300 text-sm">{n.city}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 text-sm font-bold">{n.listings} listings</span>
                  </div>
                </div>
                <div className="absolute inset-0 ring-2 ring-amber-500/0 group-hover:ring-amber-400/50 rounded-2xl transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — your SVGs ─────────────────────────────────── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-50 blur-3xl opacity-60 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>How HOMi works</h2>
            <p className="text-gray-400 font-medium mt-3">Find your home in 3 easy steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-24 left-[calc(33%+24px)] right-[calc(33%+24px)]" style={{ background:'repeating-linear-gradient(90deg, #FCD34D 0, #FCD34D 8px, transparent 8px, transparent 20px)', height:2 }} />
            {[
              { num:'01', img:searchIllustration,  title:'Search & Filter',     desc:'Use smart filters — price, location, bedrooms — to find exactly what you need. Save searches for instant alerts.' },
              { num:'02', img:connectIllustration,  title:'Connect with Agents', desc:'Message verified agents and owners directly in the app. Schedule viewings at your convenience.' },
              { num:'03', img:moveInIllustration,   title:'Move In Safely',      desc:'Complete paperwork digitally, pay through our secure platform, and move into your new home with confidence.' },
            ].map(({ num, img, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-44 h-44 mx-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                    <img src={img} alt={title} className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-9 h-9 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">{num}</div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKET INSIGHTS STRIP ───────────────────────────────────── */}
      <section className="py-12 bg-amber-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle, white 1.5px, transparent 0)', backgroundSize:'32px 32px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-amber-200 text-xs font-bold uppercase tracking-widest mb-0.5">Market Update · Q1 2025</p>
                <h3 className="text-xl sm:text-2xl font-black">Douala rents up <span className="text-amber-200">12%</span> this quarter — lock in a deal now.</h3>
              </div>
            </div>
            <Link to="/properties" className="flex-shrink-0">
              <button className="bg-white text-amber-700 hover:bg-amber-50 rounded-xl px-7 py-3.5 font-black text-sm transition-all hover:shadow-lg flex items-center gap-2 whitespace-nowrap">
                Browse listings <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOP AGENTS ──────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Our team</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>Top Rated Agents</h2>
            </div>
            <Link to="/agents" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-amber-700 font-bold text-sm group transition-colors">
              All agents <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {AGENTS.map(a => (
              <div key={a.name} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl hover:border-amber-100 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    <img src={a.avatar} alt={a.name} className="w-16 h-16 rounded-2xl object-cover" />
                    {a.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 truncate">{a.name}</h3>
                    <p className="text-amber-600 text-sm font-semibold">{a.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.city}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2.5 py-1.5 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-amber-700">{a.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 rounded-2xl p-3 text-center">
                    <div className="text-2xl font-black text-gray-900">{a.listings}</div>
                    <div className="text-xs text-gray-400 font-medium">Active listings</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 text-center">
                    <div className="text-2xl font-black text-gray-900">{a.sales}</div>
                    <div className="text-xs text-gray-400 font-medium">Total sales</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2.5 text-sm font-bold transition-all">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-amber-300 hover:text-amber-700 text-gray-600 rounded-xl py-2.5 text-sm font-bold transition-all">
                    <Phone className="w-4 h-4" /> Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY HOMI — your SVGs ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">Our promise</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>Why choose HOMi?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { img:trustBadgeIcon, title:'100% Verified',        desc:'Every property and agent is thoroughly reviewed. Zero scams, zero fake listings on our platform.' },
              { img:verifiedIcon,   title:'Transparent Pricing',  desc:'No hidden fees. What you see is what you pay. Clear, honest pricing from day one.' },
              { img:supportIcon,    title:'24/7 Support',         desc:'Our dedicated team is always here to help you through every step of your property journey.' },
            ].map(({ img, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center group p-6 rounded-3xl hover:bg-amber-50 border-2 border-transparent hover:border-amber-100 transition-all duration-300">
                <div className="w-28 h-28 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                  <img src={img} alt={title} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
            {[
              { icon:ThumbsUp, val:'98%',    label:'Satisfaction rate' },
              { icon:Shield,   val:'0',       label:'Scam reports ever' },
              { icon:Zap,      val:'~30 min', label:'Avg. agent reply'  },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <Icon className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="font-black text-gray-900 text-lg">{val}</div>
                <div className="text-gray-400 text-xs font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">Real stories</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>What customers say</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-6 right-8 text-amber-100"><Quote className="w-20 h-20" /></div>
              <p className="text-xl sm:text-2xl text-gray-700 font-medium leading-relaxed mb-8 relative z-10">
                "{TESTIMONIALS[activeTmn].text}"
              </p>
              <div className="flex items-center gap-4">
                <img src={TESTIMONIALS[activeTmn].avatar} alt={TESTIMONIALS[activeTmn].name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-100" />
                <div>
                  <h4 className="font-black text-gray-900">{TESTIMONIALS[activeTmn].name}</h4>
                  <p className="text-amber-600 text-sm font-semibold">{TESTIMONIALS[activeTmn].role} · {TESTIMONIALS[activeTmn].city}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: TESTIMONIALS[activeTmn].rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTmn(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeTmn ? 'w-8 h-2.5 bg-amber-600' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LIST YOUR PROPERTY ───────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-gray-950 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative">
            <div className="p-10 sm:p-14 relative z-10">
              <span className="inline-block bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">For property owners</span>
              <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: "'Fraunces', serif" }}>List your property today</h2>
              <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">Join 500+ landlords already using HOMi to reach 10,000+ active monthly users across Cameroon.</p>
              <ul className="space-y-3 mb-8">
                {['Free to list your first property','Reach qualified buyers & renters','Manage inquiries from one dashboard','Dedicated agent support'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/become-agent">
                  <button className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-7 py-3.5 font-bold text-sm transition-all flex items-center gap-2">
                    List for Free <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/how-it-works">
                  <button className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-xl px-7 py-3.5 font-bold text-sm transition-all">Learn more</button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&h=600&fit=crop&q=80" alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="py-20 bg-amber-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle, white 1.5px, transparent 0)', backgroundSize:'36px 36px' }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-5 max-w-2xl mx-auto" style={{ fontFamily: "'Fraunces', serif" }}>
            Ready to find your next home?
          </h2>
          <p className="text-amber-100 text-base font-medium mb-10 max-w-lg mx-auto">
            Join 10,000+ Cameroonians who found their perfect home on HOMi. It's free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <button className="bg-white text-amber-700 hover:bg-amber-50 rounded-xl px-9 py-4 font-bold text-sm transition-all hover:shadow-xl flex items-center gap-2">
                <Search className="w-4 h-4" /> Browse Properties
              </button>
            </Link>
            <Link to="/user/auth">
              <button className="bg-amber-700/50 hover:bg-amber-700/70 border border-white/30 text-white rounded-xl px-9 py-4 font-bold text-sm transition-all flex items-center gap-2">
                <HomeIcon className="w-4 h-4" /> Create Free Account
              </button>
            </Link>
          </div>
          <p className="text-amber-200 text-xs mt-5 font-medium">No credit card required · Free forever for renters</p>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-14px) rotate(2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Home;