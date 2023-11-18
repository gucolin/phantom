import React, { useState, useEffect } from "react";

export interface RagnoteDBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<RagnoteDBEntry[]>([]);

  const handleSearch = async (query: string) => {
    const results: RagnoteDBEntry[] = await window.database.search(query, 10);
    setSearchResults(results);
  };

  const debouncedSearch = debounce((query: string) => handleSearch(query), 300);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div className="relative p-4">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-md w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <div className="absolute top-14 left-0 z-10 w-full bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto">
        {searchResults.map((result, index) => (
          <div key={index} className="border-b border-gray-300 p-2">
            <p>{result.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const debounce = <F extends (...args: any[]) => void>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let debounceTimer: NodeJS.Timeout;

  return (...args: Parameters<F>) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), delay);
  };
};

export default SearchComponent;
