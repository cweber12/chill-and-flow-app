"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface LocationInputProps {
  city: string;
  state: string;
  zip: string;
  onCityChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onZipChange: (v: string) => void;
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

export function LocationInput({
  city,
  state,
  zip,
  onCityChange,
  onStateChange,
  onZipChange,
}: LocationInputProps) {
  const [detecting, setDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const zipDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (zipDebounceRef.current) clearTimeout(zipDebounceRef.current);
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    };
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detectedCity = addr.city || addr.town || addr.village || "";
            const detectedState = addr.state || "";
            const detectedZip = addr.postcode || "";
            // Convert full state name to 2-letter code
            const stateCode = getStateCode(detectedState);
            onCityChange(detectedCity);
            onStateChange(stateCode || detectedState);
            onZipChange(detectedZip);
          }
        } catch {
          // Silently fail
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { timeout: 10000 },
    );
  }, [onCityChange, onStateChange, onZipChange]);

  // Autocomplete city from zip
  const handleZipChange = useCallback(
    (value: string) => {
      onZipChange(value);
      if (zipDebounceRef.current) clearTimeout(zipDebounceRef.current);
      if (value.length === 5 && /^\d{5}$/.test(value)) {
        zipDebounceRef.current = setTimeout(async () => {
          try {
            const res = await fetch(`https://api.zippopotam.us/us/${value}`);
            if (res.ok) {
              const data = await res.json();
              if (data.places && data.places.length > 0) {
                const place = data.places[0];
                onCityChange(place["place name"] || "");
                onStateChange(place["state abbreviation"] || "");
              }
            }
          } catch {
            // Silently fail
          }
        }, 300);
      }
    },
    [onCityChange, onStateChange, onZipChange],
  );

  // Autocomplete suggestions for city
  const handleCityInput = useCallback(
    (value: string) => {
      onCityChange(value);
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
      if (value.length >= 3) {
        cityDebounceRef.current = setTimeout(async () => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(value)}&countrycodes=us&format=json&limit=5&addressdetails=1`,
              { headers: { "Accept-Language": "en" } },
            );
            if (res.ok) {
              const data = await res.json();
              const cityNames = data
                .map(
                  (r: {
                    address?: {
                      city?: string;
                      town?: string;
                      village?: string;
                    };
                  }) => {
                    const a = r.address || {};
                    return a.city || a.town || a.village || "";
                  },
                )
                .filter((n: string) => n)
                .filter(
                  (v: string, i: number, a: string[]) => a.indexOf(v) === i,
                );
              setSuggestions(cityNames);
              setShowSuggestions(cityNames.length > 0);
            }
          } catch {
            setSuggestions([]);
          }
        }, 400);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [onCityChange],
  );

  const selectSuggestion = (s: string) => {
    onCityChange(s);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Location</label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="text-xs text-accent hover:underline disabled:opacity-50"
        >
          {detecting ? "Detecting…" : "📍 Use my location"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative" ref={wrapperRef}>
          <label htmlFor="loc-city" className="sr-only">
            City
          </label>
          <input
            id="loc-city"
            type="text"
            value={city}
            onChange={(e) => handleCityInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className={inputClass}
            placeholder="City"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg max-h-40 overflow-auto">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="loc-state" className="sr-only">
            State
          </label>
          <select
            id="loc-state"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className={inputClass}
          >
            <option value="">State</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="loc-zip" className="sr-only">
            ZIP
          </label>
          <input
            id="loc-zip"
            type="text"
            value={zip}
            onChange={(e) => handleZipChange(e.target.value)}
            className={inputClass}
            placeholder="ZIP Code"
            maxLength={5}
            pattern="\d{5}"
          />
        </div>
      </div>
    </div>
  );
}

const STATE_MAP: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

function getStateCode(name: string): string {
  if (name.length === 2) return name.toUpperCase();
  return STATE_MAP[name.toLowerCase()] || "";
}
