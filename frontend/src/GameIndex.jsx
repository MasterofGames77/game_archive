// Import React library and state management via hooks, as well as CSS for styling.
import React, { useState, useEffect } from 'react';
import './game_index.css';

const GameIndex = () => {
    // State for managing the list of games.
    const [games, setGames] = useState([]);
    // State for managing search parameters.
    const [searchParams, setSearchParams] = useState({
        title: '',
        developer: '',
        publisher: '',
        genre: '',
        platform: '',
    });
    // State to control visibility of sort buttons.
    const [showSortButtons, setShowSortButtons] = useState(false);
    // State to control visibility of the modal for displaying game artwork.
    const [modalOpen, setModalOpen] = useState(false);
    // State to store the URL of the selected game's artwork.
    const [selectedGameArtwork, setSelectedGameArtwork] = useState('');

    // Effect hook to fetch games data on component mount.
    useEffect(() => {
        // Placeholder for fetching games. Normally fetch data here.
    }, []);

    // Handler for input changes, updates the search parameters state.
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setSearchParams({ ...searchParams, [id]: value });
    };

    // Function to fetch video games based on search query.
    const fetchVideoGames = async (query = '') => {
        const apiUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3001'
            : 'https://video-game-archive-204be6e591a2.herokuapp.com';
    
        try {
            const response = await fetch(`${apiUrl}/videogames${query}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    // Handler to perform search based on the search parameters.
    const handleSearch = () => {
        const { title, developer, publisher, genre, platform } = searchParams;
        let query = '?';
        if (title) query += `title=${encodeURIComponent(title)}&`;
        if (developer) query += `developer=${encodeURIComponent(developer)}&`;
        if (publisher) query += `publisher=${encodeURIComponent(publisher)}&`;
        if (genre) query += `genre=${encodeURIComponent(genre)}&`;
        if (platform) query += `platform=${encodeURIComponent(platform)}&`;
        query = query.slice(0, -1); // Remove trailing '&' or '?' if no parameters

        if (query !== '?') {
            fetchVideoGames(query);
        } else {
            setGames([]);
            setShowSortButtons(false);
        }
    };

    // Function to display video games in a table format.
    const displayVideoGames = (data) => {
        const tableBody = videogamesTable.querySelector('tbody');
        tableBody.innerHTML = ''; // Clear any previous content
        if (data.length === 0) {
            return (
                <tr>
                    <td colSpan="6">No games found</td>
                </tr>
            );
        }
        return data.map(game => {
            const releaseDate = new Date(game.release_date).toISOString().split('T')[0];
            return (
                <tr key={game.id} onClick={() => handleGameClick(game.artwork_url)}>
                    <td>{game.title}</td>
                    <td>{game.developer}</td>
                    <td>{game.publisher}</td>
                    <td>{game.genre}</td>
                    <td>{releaseDate}</td>
                    <td>{game.platform}</td>
                </tr>
            );
        });
    };

    // Handler for clicking on a game title to display its artwork.
    const handleGameClick = (artworkUrl) => {
        if (artworkUrl) {
            setSelectedGameArtwork(artworkUrl);
            setModalOpen(true);
        }
    };

    // Function to close the modal displaying the artwork.
    const closeModal = () => {
        setModalOpen(false);
        setSelectedGameArtwork('');
    };

    // Function to sort games by title.
    const sortByTitle = () => {
        const sortedData = [...games].sort((a, b) => a.title.localeCompare(b.title));
        setGames(sortedData);
    };

    // Function to sort games by release date.
    const sortByDate = () => {
        const sortedData = [...games].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        setGames(sortedData);
    };

    // Rendering the component.
    return (
        <div className="container">
            <h1>Video Games Archive</h1>
            <div className="search-container">
                <input type="text" id="title" placeholder="Search by title" onChange={handleInputChange} />
                <input type="text" id="developer" placeholder="Search by developer" onChange={handleInputChange} />
                <input type="text" id="publisher" placeholder="Search by publisher" onChange={handleInputChange} />
                <input type="text" id="genre" placeholder="Search by genre" onChange={handleInputChange} />
                <input type="text" id="platform" placeholder="Search by platform" onChange={handleInputChange} />
                <button onClick={handleSearch}>Search</button>
            </div>
            {showSortButtons && (
                <div id="sort-buttons">
                    <button onClick={sortByTitle}>Sort by Title</button>
                    <button onClick={sortByDate}>Sort by Release Date</button>
                </div>
            )}
            {games.length > 0 && (
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
                        {displayVideoGames(games)}
                    </tbody>
                </table>
            )}
            {modalOpen && (
                <div id="myModal" className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <img id="game-artwork" src={selectedGameArtwork} alt="Game Artwork" style={{ width: '100%' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameIndex;