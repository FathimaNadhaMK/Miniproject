import { useState } from "react";

const AnnouncementPage = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:5000/search?query=${query}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    return (
        <div>
            {/* Search Input */}
            <input 
                type="text" 
                placeholder="Search announcements..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
            />
            {/* Search Button */}
            <button onClick={handleSearch}>🔍 Search</button>

            {/* Search Results */}
            <div>
                {results.map((item) => (
                    <p key={item.id}>{item.text}</p>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementPage;
