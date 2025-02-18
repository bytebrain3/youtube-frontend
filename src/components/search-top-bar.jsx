import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ArrowLeft, ArrowUpRight, X } from "lucide-react";

const SearchInput = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // Load search history when component mounts
    getSearchHistory();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    // Add new search to history
    const newHistory = [query, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(newHistory);
    
    // Save to localStorage
    localStorage.setItem('search-history', JSON.stringify(newHistory));
    
    // Navigate to search results
    router.push(`/search/query/${query}`);
  };

  const getSearchHistory = () => {
    const history = localStorage.getItem('search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const removeSearchItem = (indexToRemove) => {
    const newHistory = searchHistory.filter((_, index) => index !== indexToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full h-12 flex flex-row items-center justify-between space-x-2 p-6 mt-4">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} size={40} />
        <Input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant='link' onClick={handleSearch}>
          <Search />
        </Button>
      </div>
      
      {/* Search History Display */}
      {searchHistory.length > 0 && (
        <div className="px-6 mt-2 w-full">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-500">Recent searches:</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearSearchHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="w-full flex justify-between items-center group bg-secondary p-2 rounded-md cursor-pointer"
              >
                <span>{item}</span>
                <div className="flex items-center gap-2">
                  <X
                    size={24}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => removeSearchItem(index)}
                  />
                  <ArrowUpRight 
                    size={20}
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => router.push(`/search/query/${item}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
