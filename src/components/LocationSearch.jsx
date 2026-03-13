// src/components/LocationSearch.jsx
//
// Reusable location search input.
// - Shows cities with active listings first (from DB via /public/cities)
// - Falls back to Nominatim geocoding filtered to Cameroon for free-text
// - Returns { label, shortLabel, lat, lng } to parent via onSelect
//
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Building2, X } from 'lucide-react';
import { fetchCities, searchPlacesCameroon } from '../api/public/cities';

const LocationSearch = ({
  value          = '',
  onChange,           // (stringValue) => void  — called on every keystroke
  onSelect,           // ({ label, shortLabel, lat, lng }) => void  — confirmed pick
  placeholder    = 'Search city or neighbourhood…',
  className      = '',
  inputClassName = '',
  autoFocus      = false,
}) => {
  const [query,       setQuery]       = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [dbCities,    setDbCities]    = useState([]);   // cities from DB
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // Load DB cities once on mount
  useEffect(() => {
    fetchCities()
      .then(res => setDbCities(res.data || []))
      .catch(() => {});
  }, []);

  // Sync external value changes
  useEffect(() => { setQuery(value); }, [value]);

  // Click-outside → close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildSuggestions = useCallback(async (q) => {
    const trimmed = q.trim();

    if (!trimmed) {
      // Default: show all DB cities
      setSuggestions(
        dbCities.map(c => ({
          label:      `${c.city}, ${c.region}`,
          shortLabel: c.city,
          lat:        c.lat,
          lng:        c.lng,
          count:      c.listing_count,
          source:     'db',
        }))
      );
      setOpen(dbCities.length > 0);
      return;
    }

    // Instant DB filter
    const dbMatches = dbCities
      .filter(c =>
        c.city.toLowerCase().includes(trimmed.toLowerCase()) ||
        (c.region || '').toLowerCase().includes(trimmed.toLowerCase())
      )
      .map(c => ({
        label:      `${c.city}, ${c.region}`,
        shortLabel: c.city,
        lat:        c.lat,
        lng:        c.lng,
        count:      c.listing_count,
        source:     'db',
      }));

    setSuggestions(dbMatches);
    setOpen(true);

    // Enrich with Nominatim (debounced, min 2 chars)
    if (trimmed.length >= 2) {
      setLoading(true);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const geo = await searchPlacesCameroon(trimmed, 6);
          const geoItems = geo
            .filter(g => !dbMatches.some(
              d => d.shortLabel.toLowerCase() === g.shortLabel.toLowerCase()
            ))
            .map(g => ({ ...g, source: 'geo' }));
          setSuggestions([...dbMatches, ...geoItems]);
        } catch {
          /* keep DB results */
        } finally {
          setLoading(false);
        }
      }, 350);
    }
  }, [dbCities]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
    buildSuggestions(val);
  };

  const handleSelect = (item) => {
    const label = item.shortLabel || item.label;
    setQuery(label);
    onChange?.(label);
    onSelect?.({ ...item, label });
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    onSelect?.({ label: '', shortLabel: '', lat: null, lng: null });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => buildSuggestions(query)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl
            focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none
            text-sm text-gray-800 placeholder-gray-400 bg-white ${inputClassName}`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
        )}
        {!loading && query && (
          <button onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200
          rounded-2xl shadow-2xl z-[9999] overflow-hidden max-h-72 overflow-y-auto">

          {suggestions.some(s => s.source === 'db') && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider
              bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> Cities with listings
            </div>
          )}
          {suggestions.filter(s => s.source === 'db').map((item, i) => (
            <button key={`db-${i}`} onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50
                transition-colors text-left border-b border-gray-50 last:border-0">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.shortLabel}</p>
                <p className="text-xs text-gray-400 truncate">{item.label}</p>
              </div>
              {item.count != null && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {suggestions.some(s => s.source === 'geo') && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider
              bg-gray-50 border-y border-gray-100 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> All places in Cameroon
            </div>
          )}
          {suggestions.filter(s => s.source === 'geo').map((item, i) => (
            <button key={`geo-${i}`} onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50
                transition-colors text-left border-b border-gray-50 last:border-0">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{item.shortLabel}</p>
                <p className="text-xs text-gray-400 truncate">{item.label.split(',').slice(0,3).join(',')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;