import React, { useEffect, useState, memo, useCallback, useMemo } from 'react';
import './game_index.css';
import axios from 'axios';
import debounce from 'lodash/debounce';

// The GameList component is the main component for the game list page.
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
  const [noResultsMessage, setNoResultsMessage] = useState('');

  const apiUrl = useMemo(() => 
    window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : process.env.REACT_APP_API_URL,
    []
  );

  const handleTitleClick = useCallback(artwork_url => {
    if (artwork_url.startsWith('http')) {
      setSelectedGameArtwork(artwork_url);
    } else {
      setSelectedGameArtwork(`${process.env.PUBLIC_URL}/${artwork_url}`);
    }
  }, []);

  const filterGames = useCallback((games, criteria) => {
    if (!criteria.title && !criteria.developer && !criteria.publisher && 
        !criteria.genre && !criteria.platform) {
      return [];
    }

    return games.filter(game => {
      const matchesTitle = !criteria.title || 
        game.title.toLowerCase().includes(criteria.title.toLowerCase());
      const matchesDeveloper = !criteria.developer || 
        game.developer.toLowerCase().includes(criteria.developer.toLowerCase());
      const matchesPublisher = !criteria.publisher || 
        game.publisher.toLowerCase().includes(criteria.publisher.toLowerCase());
      const matchesGenre = !criteria.genre || 
        game.genre.toLowerCase().includes(criteria.genre.toLowerCase());
      const matchesPlatform = !criteria.platform || 
        game.platform.toLowerCase().includes(criteria.platform.toLowerCase());

      return matchesTitle && matchesDeveloper && matchesPublisher && 
             matchesGenre && matchesPlatform;
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (!Object.values(searchCriteria).some(Boolean)) {
      setFilteredGames([]);
      setNoResultsMessage('Please enter search criteria');
      return;
    }

    const filtered = filterGames(videoGamesData, searchCriteria);
    setFilteredGames(filtered);
    setNoResultsMessage(filtered.length === 0 ? 'No results found that met search criteria' : '');
  }, [searchCriteria, videoGamesData, filterGames]);

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  const handleSortByTitle = useCallback(() => {
    setFilteredGames(prev => [...prev].sort((a, b) => a.title.localeCompare(b.title)));
  }, []);

  const handleSortByReleaseDate = useCallback(() => {
    setFilteredGames(prev => [...prev].sort((a, b) => new Date(a.release_date) - new Date(b.release_date)));
  }, []);

  const handleInputChange = useCallback((field) => (e) => {
    setSearchCriteria(prev => ({ ...prev, [field]: e.target.value }));
    debouncedSearch();
  }, [debouncedSearch]);

  const TableRows = useMemo(() => (
    filteredGames.map(game => (
      <tr key={game.id}>
        <td onClick={() => handleTitleClick(game.artwork_url)} className="clickable-title">
          {game.title}
        </td>
        <td>{game.developer}</td>
        <td>{game.publisher}</td>
        <td>{game.genre}</td>
        <td>{new Date(game.release_date).toISOString().split('T')[0]}</td>
        <td>{game.platform}</td>
      </tr>
    ))
  ), [filteredGames, handleTitleClick]);

  const handleCloseArtwork = useCallback(() => {
    setSelectedGameArtwork(null);
  }, []);

  const handleClear = useCallback(() => {
    setSearchCriteria({
      title: '',
      developer: '',
      publisher: '',
      genre: '',
      platform: ''
    });
    setFilteredGames([]);
    setNoResultsMessage('');
  }, []);

  const api = useMemo(() => axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
    }
  }), [apiUrl]);

  useEffect(() => {
    api.get('/videogames')
      .then(response => {
        if (Array.isArray(response.data)) {
          setVideoGamesData(response.data);
        } else {
          console.error('Unexpected data format:', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [api]);

  return (
    <div className="container">
      <img src={`${process.env.PUBLIC_URL}/video-game-archive-logo.png`} alt="Video Game Archive" className="logo" />
      <div className="search-container">
        <input type="text" id="title" value={searchCriteria.title} placeholder="Search by title" onChange={handleInputChange('title')} />
        <input type="text" id="developer" value={searchCriteria.developer} placeholder="Search by developer" onChange={handleInputChange('developer')} />
        <input type="text" id="publisher" value={searchCriteria.publisher} placeholder="Search by publisher" onChange={handleInputChange('publisher')} />
        <input type="text" id="genre" value={searchCriteria.genre} placeholder="Search by genre" onChange={handleInputChange('genre')} />
        <input type="text" id="platform" value={searchCriteria.platform} placeholder="Search by platform" onChange={handleInputChange('platform')} />
        <div className="button-container">
          <button onClick={handleSearch}>Search</button>
          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
      <div id="sort-buttons" style={{ display: filteredGames.length ? 'block' : 'none' }}>
        <button onClick={handleSortByTitle}>Sort by Title (A-Z)</button>
        <button onClick={handleSortByReleaseDate}>Sort by Release Date</button>
      </div>
      {noResultsMessage && !filteredGames.length && (
        <div className="no-results-message">
          {noResultsMessage}
        </div>
      )}
      {filteredGames.length > 0 && (
        <table id="videogames-table">
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
            {TableRows}
          </tbody>
        </table>
      )}
      {selectedGameArtwork && (
        <div className="artwork-modal" onClick={handleCloseArtwork}>
          <span className="close-button" onClick={handleCloseArtwork}>&times;</span>
          <img src={selectedGameArtwork} alt="Game Artwork" className="artwork-image" />
        </div>
      )}
    </div>
  );
};

GameList.propTypes = {
  // Add if you convert any of this to props
};

export default memo(GameList);