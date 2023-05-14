import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '36335087-8fc82f57bcc883baed7c9a06e';
const API_URL = 'https://pixabay.com/api/?';
let page = 1;
let perPage = 40;
let existsPhotos = [];

const formEl = document.getElementById('search-form');
const inputEl = document.querySelector('input[type="text"]');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

// czyszczenie zawartości elementu
function clearSearch() {
  galleryEl.innerHTML = '';
}

// funkcja z użyciem biblioteki axios, wykonanuje żądanie HTTP typu GET
// parametry żądania z zadania
const fetchPhotos = async () => {
  const data = await axios.get(API_URL, {
    params: {
      key: KEY,
      q: inputEl.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: perPage,
    },
  });
  return data;
};

// funkcja loadPhotos wywołuje funkcję fetchPhotos,przetwarza dane,wyświetla komunikaty używając biblioteki notiflix
const loadPhotos = () => {
  fetchPhotos()
    .then(photos => {
      let result = photos.data.totalHits;

      if (result === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else if (result <= page * perPage) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        Notiflix.Notify.success(`Hooray! We found ${result} images.`);
        galleryEl.innerHTML = showPhotoCards(photos);
        let gallery = new SimpleLightbox('.gallery a');
        gallery.on('show.simplelightbox');
        loadMoreBtn.classList.remove('is-hidden');

        if (page >= 1) {
          gallery.refresh();

          const { height: cardHeight } = document
            .querySelector('.gallery')
            .firstElementChild.getBoundingClientRect();
          window.scrollBy({
            top: cardHeight * 4,
            behavior: 'smooth',
          });
        }
      }
    })
    .catch(error => console.log(error));
};

// nasłuchuje zdarzenia submit na elemencie search-form, czyści wyniki wyszukiwania
// zapobiega domyślnemu zachowaniu przesłania formularza, wywołuje funkcję loadPhotos
formEl.addEventListener('submit', event => {
  clearSearch();
  event.preventDefault();
  loadPhotos();
});

// funkcja showPhotoCards daje tablicę obiektów zdjęć i generuje kod HTML dla każdej karty zdjęć
// link, polubienia, wyświetlenia, komentarze, pobrania - z zadania
function showPhotoCards(photos) {
  const arrayOfPhotos = photos.data.hits;
  existsPhotos.push(...arrayOfPhotos);
  return existsPhotos
    .map(
      card => `
      <div class="photo-card">
        <div class="photo-container">
          <a href="${card.largeImageURL}">
            <img src="${card.webformatURL}" width="100%" alt="${card.tags}" loading="lazy" />
          </a>
        </div>
        
        <div class="info">
           <p class="info-item">
             <b>Likes:<br>${card.likes}</b>
           </p>
           <p class="info-item">
             <b>Views:<br>${card.views}</b>
           </p>
           <p class="info-item">
             <b>Comments:<br>${card.comments}</b>
           </p>
           <p class="info-item">
             <b>Downloads:<br>${card.downloads}</b>
           </p>
        </div>
       </div>`
    )
    .join('');
}

// nasłuchiwanie zdarzenia kliknięcia na przycisku load-more,
// inkrementuje zmienną page, wywołuje funkcję loadPhotos, ładuje następny zestaw zdjęć
loadMoreBtn.addEventListener('click', event => {
  event.preventDefault();
  page++;

  loadPhotos();
});
