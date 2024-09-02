import React, { useEffect, useState } from 'react';
import './game_index.css';
import axios from 'axios';

const GameList = () => {
  // State to store all video games fetched from the database.
  const [videoGamesData, setVideoGamesData] = useState([]);
  // State to store filtered list of games based on search criteria.
  const [filteredGames, setFilteredGames] = useState([]);
  // State to store search parameters entered by the user.
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    developer: '',
    publisher: '',
    genre: '',
    platform: ''
  });
  // State to manage the display of the modal showing the game artwork.
  const [selectedGameArtwork, setSelectedGameArtwork] = useState(null);
  // State to store the message when no results are found.
  const [noResultsMessage, setNoResultsMessage] = useState('');
  
  useEffect(() => {
    const apiUrl = "https://video-game-archive-204be6e591a2.herokuapp.com";

    axios.get(`${apiUrl}/videogames`, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (Array.isArray(response.data)) {
            setVideoGamesData(response.data);
        } else {
            console.error('Unexpected data format:', response.data[0]);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}, []);


  // Handler for search button click, filters video games based on search criteria.
  const handleSearch = () => {
    if (!searchCriteria.title && !searchCriteria.developer && !searchCriteria.publisher && !searchCriteria.genre && !searchCriteria.platform) {
      setFilteredGames([]);
      setNoResultsMessage('Please enter search criteria');
      return;
    }

    if (Array.isArray(videoGamesData)) { // Ensure videoGamesData is an array
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
      setNoResultsMessage(filtered.length === 0 ? 'No results found that met search criteria' : '');
    } else {
      console.error('videoGamesData is not an array:', videoGamesData);
      setNoResultsMessage('An error occurred while searching. Please try again later.');
    }
};

  // Handler to sort games by title in alphabetical order.
  const handleSortByTitle = () => {
    const sorted = [...filteredGames].sort((a, b) => a.title.localeCompare(b.title));
    setFilteredGames(sorted);
  };

  // Handler to sort games by release date from oldest to newest.
  const handleSortByReleaseDate = () => {
    const sorted = [...filteredGames].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    setFilteredGames(sorted);
  };

  // Handler for clicking on game titles to display their artwork.
  const handleTitleClick = artwork_url => {
    if (artwork_url.startsWith('http')) {
      setSelectedGameArtwork(artwork_url);
    } else {
      setSelectedGameArtwork(`${process.env.PUBLIC_URL}/${artwork_url}`);
    }
  };

  // Handler to close the modal and clear the selected artwork.
  const handleCloseArtwork = () => {
    setSelectedGameArtwork(null);
  };

  // Handler to clear the search boxes and table.
  const handleClear = () => {
    setSearchCriteria({
      title: '',
      developer: '',
      publisher: '',
      genre: '',
      platform: ''
    });
    setFilteredGames([]);
    setNoResultsMessage('');
  };

  // JSX rendering of the component.
  return (
    <div className="container">
      <h1>Video Games Archive</h1>
      <div className="search-container">
        <input type="text" id="title" value={searchCriteria.title} placeholder="Search by title" onChange={e => setSearchCriteria({ ...searchCriteria, title: e.target.value })} />
        <input type="text" id="developer" value={searchCriteria.developer} placeholder="Search by developer" onChange={e => setSearchCriteria({ ...searchCriteria, developer: e.target.value })} />
        <input type="text" id="publisher" value={searchCriteria.publisher} placeholder="Search by publisher" onChange={e => setSearchCriteria({ ...searchCriteria, publisher: e.target.value })} />
        <input type="text" id="genre" value={searchCriteria.genre} placeholder="Search by genre" onChange={e => setSearchCriteria({ ...searchCriteria, genre: e.target.value })} />
        <input type="text" id="platform" value={searchCriteria.platform} placeholder="Search by platform" onChange={e => setSearchCriteria({ ...searchCriteria, platform: e.target.value })} />
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

export default GameList;