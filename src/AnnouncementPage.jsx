import React, { useState } from 'react';

const AnnouncementPage = () => {
  const [query, setQuery] = useState(""); // Store user input
  const [results, setResults] = useState([]); // Store search results
  const [saved, setSaved] = useState([]); // Saved announcements
  const [showSaved, setShowSaved] = useState(false); // Toggle modal visibility
  const [loading, setLoading] = useState(false); // Loading state for search

  // Fetch search results from backend
  const handleSearch = async () => {
    if (!query.trim()) return; // Prevent empty search
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/search?query=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle save/unsave announcements
  const toggleSave = (id) => {
    setSaved(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Toggle saved announcements modal
  const toggleShowSaved = () => {
    setShowSaved(prev => !prev);
  };

  const announcements = [
    { id: 1, isGovernment: true, date: "2023-07-10", text: "New community health policy update." },
    { id: 2, isGovernment: false, text: "Community picnic scheduled this weekend." },
    { id: 3, isGovernment: true, date: "2023-07-11", text: "Road safety measures implemented." },
    { id: 4, isGovernment: false, text: "New bakery opening downtown." },
    { id: 5, isGovernment: false, text: "Neighborhood watch meeting on Tuesday." },
    { id: 6, isGovernment: true, date: "2023-07-12", text: "Tax filing deadline extended." },
    { id: 7, isGovernment: false, text: "Free yoga classes at the park." },
    { id: 8, isGovernment: true, date: "2023-07-13", text: "Public transportation schedule updated." },
    { id: 9, isGovernment: false, text: "Farmers market on Saturday morning." },
    { id: 10, isGovernment: true, date: "2023-07-14", text: "Vaccination drive begins next week." }
  ];

  // Use search results if available, otherwise default announcements
  const displayedAnnouncements = results.length > 0 ? results : announcements;

  // Collect saved announcements
  const savedAnnouncements = displayedAnnouncements.filter(a => saved.includes(a.id));

  return (
    <div style={{ fontFamily: "'Fira Sans', sans-serif", maxWidth: '800px', margin: '40px auto', padding: '20px', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ position: 'relative', textAlign: 'center', padding: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', marginBottom: '20px' }}>
        <img 
          src="https://c8.alamy.com/comp/2K6R6X6/megaphone-announcement-icon-on-white-background-pictogram-icon-set-illustration-2K6R6X6.jpg" 
          alt="Announcement Icon" 
          style={{ width: '40px', height: '40px', verticalAlign: 'middle', marginRight: '10px' }}
        />
        <h1 style={{ display: 'inline-block', margin: 0, fontSize: '2.5rem', color: '#ffffff', fontWeight: 'bold', verticalAlign: 'middle' }}>Announcements</h1>
        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '2rem', cursor: 'pointer', color: '#ffffff' }} onClick={toggleShowSaved}>
          🔖
        </div>
      </header>

      {/* Search Section */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Search on Enter
          placeholder="Search announcements..."
          style={{ padding: '10px', fontSize: '16px', width: '70%', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        />
        <button onClick={handleSearch} style={{ padding: '10px 20px',width:'160px',height:'60px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '18px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
          🔍 Search
        </button>
      </div>

      {/* Announcements Container */}
      <div style={{ maxHeight: '400px', overflowY: 'scroll', backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
        {loading ? (
          <p>Loading announcements...</p>
        ) : displayedAnnouncements.length > 0 ? (
          displayedAnnouncements.map((announcement) => (
            <div key={announcement.id} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {announcement.isGovernment && (
                  <>
                    <img
                      src="https://image.shutterstock.com/image-vector/emblem-india-260nw-550599466.jpg"
                      alt="Gov Icon"
                      style={{ width: '24px', height: '24px', marginRight: '8px' }}
                    />
                    <span style={{ marginRight: '4px', fontSize: '0.9rem', color: '#666' }}>
                      ({announcement.date})
                    </span>
                  </>
                )}
                <p style={{ fontSize: '1.2rem', margin: 0 }}>{announcement.text}</p>
              </div>
              <button style={{ padding: '5px 10px',width:'150px',height:'50px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: saved.includes(announcement.id) ? 'gray' : 'green', color: '#fff' }} onClick={() => toggleSave(announcement.id)}>
                {saved.includes(announcement.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          ))
        ) : (
          <p>No announcements found.</p>
        )}
      </div>

      {/* Modal for saved announcements */}
      {showSaved && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', maxWidth: '500px', width: '90%' }}>
            <h2>Saved Announcements</h2>
            {savedAnnouncements.length === 0 ? (
              <p>No saved announcements.</p>
            ) : (
              savedAnnouncements.map(a => (
                <div key={a.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                  <p>{a.text}</p>
                  <button onClick={() => toggleSave(a.id)}>Remove</button>
                </div>
              ))
            )}
            <button onClick={toggleShowSaved}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementPage;