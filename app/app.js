const API_KEY = 'af86fe414dceae3a1eb1c437dda95782';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_PAGE = '1';
const NO_IMAGE_POSTER = 'https://via.placeholder.com/342x513?text=No+Image';
const NO_IMAGE_BACKDROP = 'https://via.placeholder.com/500x750?text=No+Image';
const DEFAULT_RATING = 'N/A';
const DEFAULT_YEAR = 'N/A';
const MOVIE_CARD_CLASS = 'movie-card';
const CAROUSEL_ITEM_CLASS = 'carousel-item';
const DEFAULT_GRID_LIMIT = 8;
const DEFAULT_SEARCH_LIMIT = 8;
const DEFAULT_CAROUSEL_LIMIT = 5;
const EMPTY_CLASS = 'empty';
const SECTION_HEADER_CLASS = 'section-header';
const SCROLL_DELAY = 500;
const OVERVIEW_LENGTH = 100;
const SECTION_TITLES = ['Popular Movies', 'Trending Movies', 'Top Rated Movies'];

async function fetchPopularMovies() {
    try{
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch(error){
        console.error('Error fetching movies:', error);
        return [];
    }   
}

async function handleSections(){
 const popularMovies = document.getElementById('popular-movies');
 const popularSection = document.getElementById('popular-section');
 const trendingMovies = document.getElementById('trending-movies');
 const trendingSection = document.getElementById('trending-section');
 const topRatedMovies = document.getElementById('top-rated-movies');
 const topRatedSection = document.getElementById('top-rated-section');
 const searchResults = document.getElementById('search-results');
 const searchSection = document.getElementById('search-section');

 if (popularMovies){
    if(popularMovies.children.length === 0){
        popularSection.classList.add(EMPTY_CLASS);
    }else{
        popularSection.classList.remove(EMPTY_CLASS);
    }
 }else{
    console.error('Popular movies section not found');
 }
 
 if (trendingMovies){
    if(trendingMovies.children.length === 0){
        trendingSection.classList.add(EMPTY_CLASS);
    }else{
        trendingSection.classList.remove(EMPTY_CLASS);
    }
 }else{
    console.error('Trending movies section not found');
 }
 
 if (topRatedMovies){
    if(topRatedMovies.children.length === 0){
        topRatedSection.classList.add(EMPTY_CLASS);
    }else{
        topRatedSection.classList.remove(EMPTY_CLASS);
    }
 }else{
    console.error('Top rated movies section not found');
 }
 
 if (searchResults){
    if(searchResults.children.length === 0){
        searchSection.classList.add(EMPTY_CLASS);
    }else{
        searchSection.classList.remove(EMPTY_CLASS);
    }
 }else{
    console.error('Search results section not found');
 }

 if (!popularMovies || !trendingMovies || !topRatedMovies || !searchResults) {
    console.error('One or more sections not found');
    return;
 }
}
 
async function fetchTrendingMovies() {
    try{
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch(error){
        console.error('Error fetching movies:', error);
        return [];
    }   
}

async function fetchTopRatedMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}&page=${DEFAULT_PAGE}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        return [];
    }
} 

async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

function movieCardGenerator(movie) {
    const card = document.createElement('div');
    card.className = MOVIE_CARD_CLASS;

    card.innerHTML = `
    <div class="${CAROUSEL_ITEM_CLASS}">
      <img src="${movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}`:NO_IMAGE_BACKDROP}" class="d-block w-100" alt="${movie.title}">
      <div class="carousel-caption d-none d-md-block">
        <h5>${movie.title}</h5>
        <p>${movie.overview ? movie.overview.substring(0, OVERVIEW_LENGTH) + '...' : 'No description available'}</p>
      </div>
    </div>
    `

    return card;
}

async function populateCarousel(movies) {
    const carousel = document.getElementById('carousel');
    carousel.innerHTML = '';
    const indicators = document.querySelector('.carousel-indicators');
    
    if (indicators) {
        indicators.innerHTML = ''; 
    }

   const cards = await Promise.all(
    movies.map(movie => movieCardGenerator(movie))
   );

   cards.splice(0, DEFAULT_CAROUSEL_LIMIT).forEach((card, index) => {
    if (index === 0) {
        card.querySelector(`.${CAROUSEL_ITEM_CLASS}`).classList.add('active');
    }
    carousel.append(card);
     if (indicators) {
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#carouselExampleCaptions');
        indicator.setAttribute('data-bs-slide-to', index.toString());
        if (index === 0) {
            indicator.className = 'active';
            indicator.setAttribute('aria-current', 'true');
        }
        indicator.setAttribute('aria-label', `Slide ${index + 1}`);
        indicators.appendChild(indicator);
    }
   });
   
}

async function initCarousel() {
    const movies = await fetchPopularMovies();
    await populateCarousel(movies);
}

function gridCardGenerator(movie) {
    const card = document.createElement('div');
    card.className = MOVIE_CARD_CLASS;
 
    const posterPath = movie.poster_path 
        ? `${POSTER_BASE_URL}${movie.poster_path}`
        : NO_IMAGE_POSTER;
 
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : DEFAULT_RATING;
    const year = movie.release_date ? movie.release_date.split('-')[0] : DEFAULT_YEAR;
 
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

async function handleSearch(query) {
   try {
    const movies = await searchMovies(query);
    
    const popularGrid = document.getElementById('popular-section');
    const trendingGrid = document.getElementById('trending-section');
    const topRatedGrid = document.getElementById('top-rated-section');
    const searchGrid = document.getElementById('search-results');
    const searchQuery = document.getElementById('search-query');
    const searchSection = document.getElementById('search-section');

    searchGrid.innerHTML = '';
     
   if (query.trim() === '') {
    if (searchSection) {
        searchSection.style.display = 'none';
    }

    
    document.querySelectorAll(`.${SECTION_HEADER_CLASS}`).forEach(header => {
        header.style.display = 'block';
    });

    if (searchQuery) {
        searchQuery.textContent = '';
    }

    await populateMoviesGrid();

    return;
}

    if (searchSection) {
        searchSection.style.display = 'block';
        const searchHeader = searchSection.querySelector(`.${SECTION_HEADER_CLASS}`);
        if (searchHeader) {
            searchHeader.style.display = 'block';
        }
    }

    popularGrid.classList.add(EMPTY_CLASS);
    trendingGrid.classList.add(EMPTY_CLASS);
    topRatedGrid.classList.add(EMPTY_CLASS);
    
    const searchCards = await Promise.all(
        movies.slice(0, DEFAULT_SEARCH_LIMIT).map(movie => gridCardGenerator(movie))
    );
    
    searchCards.forEach(card => {
        searchGrid.appendChild(card);
    });

    handleSections();
    if (searchQuery) {
        searchQuery.textContent = query;
    }
   } catch (error) {
    console.error('Error searching movies:', error);
   }
}

async function populateMoviesGrid() {
    try{
        const popularGrid = document.getElementById('popular-movies');
        const trendingGrid = document.getElementById('trending-movies');
        const topRatedGrid = document.getElementById('top-rated-movies');
        const grids = [popularGrid, trendingGrid, topRatedGrid];
        grids.forEach(grid => {
            if (grid) {
                grid.innerHTML = '';
            }
        });
        
        const[popularMovies, trendingMovies, topRatedMovies] = await Promise.all([
            fetchPopularMovies(),
            fetchTrendingMovies(),
            fetchTopRatedMovies()
        ]);
        console.log(popularMovies, trendingMovies, topRatedMovies);
        
        const popularCards = await Promise.all(
            popularMovies.slice(0, DEFAULT_GRID_LIMIT).map(movie => gridCardGenerator(movie))
            
        );
        if (popularCards.length > 0) {
            popularCards.forEach(card => popularGrid.appendChild(card));
        }else {
            popularGrid.classList.add(EMPTY_CLASS);
        }
        
        const trendingCards = await Promise.all(
            trendingMovies.slice(0, DEFAULT_GRID_LIMIT).map(movie => gridCardGenerator(movie))
        );
        if (trendingCards.length > 0) {
            trendingCards.forEach(card => trendingGrid.appendChild(card));
        }else{
            trendingGrid.classList.add(EMPTY_CLASS);
        }
        
        const topRatedCards = await Promise.all(
            topRatedMovies.slice(0, DEFAULT_GRID_LIMIT).map(movie => gridCardGenerator(movie))
        );
        if (topRatedCards.length > 0) {
            topRatedCards.forEach(card => topRatedGrid.appendChild(card));
        }else{
            topRatedGrid.classList.add(EMPTY_CLASS);
        }

        handleSections();
    } catch (error) {
        console.error('Error populating movies grid:', error);
    }

}

searchIcon.addEventListener('click', () => {
    const query = searchInput.value.trim();
    handleSearch(query);  
    
    setTimeout(() => {
        const searchResults = document.getElementById('search-results');
        if (searchResults && searchResults.children.length > 0) {
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
        }
    }, SCROLL_DELAY);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        handleSearch(query);
      
        setTimeout(() => {
            const searchResults = document.getElementById('search-results');
            if (searchResults && searchResults.children.length > 0) {
                document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
            }
        }, SCROLL_DELAY);
    }
});

async function loadData() {
    await initCarousel();
    await populateMoviesGrid();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});