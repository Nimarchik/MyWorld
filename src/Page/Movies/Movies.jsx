import { useEffect } from 'react';
import style from '../../assets/styles/index.module.css'

const Movies = () => {

  useEffect(() => {
    fetch('https://kinobd.net/api/films')
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      console.log(data);
      
    })
  })
  return (
    <div data-kinopoisk="12" id="kinobd"></div>
  )
}

export default Movies;