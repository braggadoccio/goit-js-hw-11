export const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '40959971-e108149cae1c96c7625c265ce';

export const options = {
  params: {
    key: API_KEY,
    q: '',
    image_type: 'photo',
    orientaion: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  },
};
