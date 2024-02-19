import React, { useEffect, useRef } from "react";
import { DBSearchPreview } from "../File/DBResultPreview";
import { DBQueryResult } from "electron/main/database/Schema";
import { FaSearch } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

interface SearchComponentProps {
  onFileSelect: (name: string, path: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: DBQueryResult[];
  setSearchResults: (results: DBQueryResult[]) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onFileSelect,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null); // Reference for the input field

  const handleSearch = async (query: string) => {
    const results: DBQueryResult[] = await window.database.search(query, 50);
    setSearchResults(results);
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  const debouncedSearch = debounce((query: string) => handleSearch(query), 300);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="p-1 w-full">
      <div className="relative bg-slate-200 rounded">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <FiSearch className="text-slate-800 text-lg" />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="w-full pl-7 pr-3 h-8 bg-slate-200 text-slate-950 rounded border border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search..."
        />
      </div>
      <div className="mt-2 w-full">
        {searchResults.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            {searchResults.map((result, index) => (
              <DBSearchPreview
                key={index}
                dbResult={result}
                onSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const debounce = <F extends (...args: string[]) => Promise<void>>(
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
