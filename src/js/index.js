import axios from 'axios';
import { Notify } from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { BASE_URL, options } from './pixabay-api.js';

// DOM Links //
const galleryElement = document.querySelector('.gallery');
const searchInputElement = document.querySelector('input[name="searchQuery"]');
const searchFormElement = document.getElementById('search-form');
const loadMoreButton = document.querySelector('.load-more');

// Instantiate SimpleLightBox //
const lightbox = new simpleLightbox('.lightbox', {
  captionData: 'alt',
  captionDelay: 250,
});

loadMoreButton.classList.add('is-hidden');

// const { BASE_URL, options } = new apiServicePixabay();

///////////////////////////////////////////////////////////////
let totalHits = 0;
let reachedEnd = false;

function renderGallery(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
              <a href="${largeImageURL}" class="lightbox">
                  <div class="photo-card">
                      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                      <div class="info">
                          <p class="info-item">
                              <b>Likes</b>
                              ${likes}
                          </p>
                          <p class="info-item">
                              <b>Views</b>
                              ${views}
                          </p>
                          <p class="info-item">
                              <b>Comments</b>
                              ${comments}
                          </p>
                          <p class="info-item">
                              <b>Downloads</b>
                              ${downloads}
                          </p>
                      </div>
                  </div>
              </a>
              `;
      }
    )
    .join('');

  galleryElement.insertAdjacentHTML('beforeend', markup);

  // Smooth page scrolling //

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  // window.scrollBy({
  //   top: cardHeight * 2,
  //   behavior: 'smooth',
  // });

  loadMoreButton.classList.remove('is-hidden');
  // scroll(totalHits);

  //   ReachEnd
  if (options.params.page * options.params.per_page >= totalHits) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      reachedEnd = true;
      loadMoreButton.classList.add('is-hidden');
    }
  }
  lightbox.refresh();
}

///////////////////////////////////////////////////////////////

async function handleSubmit(e) {
  e.preventDefault();
  options.params.q = searchInputElement.value.trim();
  if (options.params.q === '') {
    return;
  }
  options.params.page = 1;
  galleryElement.innerHTML = '';
  reachedEnd = false;

  try {
    const response = await axios.get(BASE_URL, options);
    totalHits = response.data.totalHits;

    const { hits } = response.data;
    console.log(hits);

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
    }
    searchInputElement.value = '';
  } catch (error) {
    Notify.failure(error);
  }
}

searchFormElement.addEventListener('submit', handleSubmit);

///////////////////////////////////////////////////////////////

async function loadMore() {
  options.params.page += 1;
  try {
    const response = await axios.get(BASE_URL, options);
    const hits = response.data.hits;
    renderGallery(hits);
  } catch (error) {
    Notify.failure(error);
  }
}

function onloadMoreButton() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight) {
    loadMore();
  }
}

loadMoreButton.addEventListener('click', onloadMoreButton);
