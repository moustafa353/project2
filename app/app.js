const API_KEY = 'af86fe414dceae3a1eb1c437dda95782';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';

async function fetchPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}


async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}

async function fetchTopRatedMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        return [];
    }
}

async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterPath = movie.poster_path 
        ? `${POSTER_BASE_URL}${movie.poster_path}` 
        : 'https://via.placeholder.com/342x513?text=No+Image';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    
    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${year}</p>
        </div>
        <div class="movie-rating">${rating}</div>
    `;
    
    return card;
}


async function loadMoviesIntoGrid(fetchFunction, gridId, limit = 8) {
    const movies = await fetchFunction();
    const grid = document.getElementById(gridId);
    
    if (grid) {
        const sectionHeader = grid.previousElementSibling;
        
        if (movies.length > 0) {
            grid.innerHTML = '';
            movies.slice(0, limit).forEach(movie => {
                const card = createMovieCard(movie);
                grid.appendChild(card);
            });
            
            if (sectionHeader && sectionHeader.classList.contains('section-header')) {
                sectionHeader.style.display = 'block';
            }
        } else {
            
            grid.innerHTML = '';
            if (sectionHeader && sectionHeader.classList.contains('section-header')) {
                sectionHeader.style.display = 'none';
            }
        }
    }
}

async function initializeCarousel() {
    const movies = await fetchPopularMovies();
    const carouselInner = document.querySelector('.carousel-inner');
    
    if (movies.length > 0) {
        carouselInner.innerHTML = '';
        
        movies.slice(0, 5).forEach((movie, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            
            const backdropPath = movie.backdrop_path 
                ? `${IMAGE_BASE_URL}${movie.backdrop_path}` 
                : 'https://via.placeholder.com/800x400?text=No+Image';
            
            carouselItem.innerHTML = `
                <img src="${backdropPath}" class="d-block w-100" alt="${movie.title}">
                <div class="carousel-caption d-none d-md-block">
                    <h5>${movie.title}</h5>
                    <p>${movie.overview.substring(0, 100)}...</p>
                </div>
            `;
            
            carouselInner.appendChild(carouselItem);
        });
    }
}

async function handleSearch(query) {
    if (query.trim() === '') {
    
        await loadAllMovieSections();
        return;
    }
    
    const movies = await searchMovies(query);
    
    const searchGrid = document.getElementById('popular-movies');
    const searchHeader = document.getElementById('popular-movies').previousElementSibling;
    
    if (searchGrid) {
        if (movies.length > 0) {
            searchGrid.innerHTML = '';
            movies.slice(0, 12).forEach(movie => {
                const card = createMovieCard(movie);
                searchGrid.appendChild(card);
            });
            
            if (searchHeader && searchHeader.classList.contains('section-header')) {
                searchHeader.textContent = `Search Results for "${query}"`;
                searchHeader.style.display = 'block';
            }
        } else {
            
            searchGrid.innerHTML = '';
            if (searchHeader && searchHeader.classList.contains('section-header')) {
                searchHeader.textContent = 'No results found';
                searchHeader.style.display = 'block';
            }
        }
    }
    
    const otherSections = ['trending-movies', 'top-rated-movies'];
    otherSections.forEach(gridId => {
        const grid = document.getElementById(gridId);
        const header = grid.previousElementSibling;
        if (header && header.classList.contains('section-header')) {
            header.style.display = 'none';
        }
        if (grid) {
            grid.innerHTML = '';
        }
    });
}

async function handleSearchClick() {
    const searchInput = document.querySelector('.search');
    if (searchInput) {
        await handleSearch(searchInput.value);
    }
}

async function loadAllMovieSections() {
    await Promise.all([
        loadMoviesIntoGrid(fetchPopularMovies, 'popular-movies'),
        loadMoviesIntoGrid(fetchTrendingMovies, 'trending-movies'),
        loadMoviesIntoGrid(fetchTopRatedMovies, 'top-rated-movies')
    ]);
    
    const headers = {
        'popular-movies': 'Popular Movies',
        'trending-movies': 'Trending Now',
        'top-rated-movies': 'Top Rated'
    };
    
    Object.keys(headers).forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            const header = grid.previousElementSibling;
            if (header && header.classList.contains('section-header')) {
                header.textContent = headers[gridId];
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    loadAllMovieSections();
    
    const searchInput = document.querySelector('.search');
    const searchIcon = document.querySelector('.icon');
    
    if (searchIcon) {
        searchIcon.addEventListener('click', handleSearchClick);
        searchIcon.style.cursor = 'pointer';
        searchIcon.style.pointerEvents = 'auto';
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearchClick();
            }
        });
    }
});