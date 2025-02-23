import React, { useState, memo, useCallback, useMemo } from 'react';
import './game_index.css';
import axios from 'axios';
import debounce from 'lodash/debounce';

// The GameList component is the main component for the game list page.
const GameList = () => {
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
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = useMemo(() => 
    window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : process.env.REACT_APP_API_URL,
    []
  );

  const api = useMemo(() => axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
    }
  }), [apiUrl]);

  const handleTitleClick = useCallback(artwork_url => {
    if (artwork_url.startsWith('http')) {
      setSelectedGameArtwork(artwork_url);
    } else {
      setSelectedGameArtwork(`${process.env.PUBLIC_URL}/${artwork_url}`);
    }
  }, []);

  const buildQueryString = useCallback((criteria) => {
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!Object.values(searchCriteria).some(Boolean)) {
      setFilteredGames([]);
      setNoResultsMessage('Please enter search criteria');
      return;
    }

    setIsLoading(true);
    try {
      const queryString = buildQueryString(searchCriteria);
      const response = await api.get(`/videogames${queryString ? `?${queryString}` : ''}`);
      
      if (Array.isArray(response.data)) {
        setFilteredGames(response.data);
        setNoResultsMessage(response.data.length === 0 ? 'No results found that met search criteria' : '');
      } else {
        console.error('Unexpected data format:', response.data);
        setNoResultsMessage('Error fetching results');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setNoResultsMessage('Error fetching results');
      setFilteredGames([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchCriteria, api, buildQueryString]);

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
      {isLoading ? (
        <div className="loading-message">Loading...</div>
      ) : (
        <>
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
        </>
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