import React, { useEffect, useState } from 'react';
import './game_index.css';

const GameList = () => {
  const [videoGamesData, setVideoGamesData] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    developer: '',
    publisher: '',
    genre: '',
    platform: ''
  });
  const [selectedGameArtwork, setSelectedGameArtwork] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/videogames')
      .then(response => response.json())
      .then(data => {
        setVideoGamesData(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSearch = () => {
    const filtered = videoGamesData.filter(game => {
      return (
        (!searchCriteria.title || game.title.toLowerCase().includes(searchCriteria.title.toLowerCase())) &&
        (!searchCriteria.developer || game.developer.toLowerCase().includes(searchCriteria.developer.toLowerCase())) &&
        (!searchCriteria.publisher || game.publisher.toLowerCase().includes(searchCriteria.publisher.toLowerCase())) &&
        (!searchCriteria.genre || game.genre.toLowerCase().includes(searchCriteria.genre.toLowerCase())) &&
        (!searchCriteria.platform || game.platform.toLowerCase().includes(searchCriteria.platform.toLowerCase()))
      );
    });
    setFilteredGames(filtered);
  };

  const handleSortByTitle = () => {
    const sorted = [...filteredGames].sort((a, b) => a.title.localeCompare(b.title));
    setFilteredGames(sorted);
  };

  const handleSortByReleaseDate = () => {
    const sorted = [...filteredGames].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    setFilteredGames(sorted);
  };

  const handleTitleClick = artwork_url => {
    if (artwork_url.startsWith('http')) {
      setSelectedGameArtwork(artwork_url);
    } else {
      setSelectedGameArtwork(`${process.env.PUBLIC_URL}/${artwork_url}`);
    }
  };

  const handleCloseArtwork = () => {
    setSelectedGameArtwork(null);
  };

  return (
    <div className="container">
      <h1>Video Games Archive</h1>
      <div className="search-container">
        <input type="text" placeholder="Search by title" onChange={e => setSearchCriteria({ ...searchCriteria, title: e.target.value })} />
        <input type="text" placeholder="Search by developer" onChange={e => setSearchCriteria({ ...searchCriteria, developer: e.target.value })} />
        <input type="text" placeholder="Search by publisher" onChange={e => setSearchCriteria({ ...searchCriteria, publisher: e.target.value })} />
        <input type="text" placeholder="Search by genre" onChange={e => setSearchCriteria({ ...searchCriteria, genre: e.target.value })} />
        <input type="text" placeholder="Search by platform" onChange={e => setSearchCriteria({ ...searchCriteria, platform: e.target.value })} />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div id="sort-buttons" style={{ display: filteredGames.length ? 'block' : 'none' }}>
        <button onClick={handleSortByTitle}>Sort by Title</button>
        <button onClick={handleSortByReleaseDate}>Sort by Release Date</button>
      </div>
      <table id="videogames-table" style={{ display: filteredGames.length ? 'table' : 'none' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Developer</th>
            <th>Publisher</th>
            <th>Genre</th>
            <th>Release Date</th>
            <th>Platform</th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.map(game => (
            <tr key={game.id}>
              <td onClick={() => handleTitleClick(game.artwork_url)} className="clickable-title">{game.title}</td>
              <td>{game.developer}</td>
              <td>{game.publisher}</td>
              <td>{game.genre}</td>
              <td>{new Date(game.release_date).toISOString().split('T')[0]}</td>
              <td>{game.platform}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedGameArtwork && (
        <div className="artwork-modal" onClick={handleCloseArtwork}>
          <span className="close-button" onClick={handleCloseArtwork}>&times;</span>
          <img src={selectedGameArtwork} alt="Game Artwork" className="artwork-image" />
        </div>
      )}
    </div>
  );
};

export default GameList;