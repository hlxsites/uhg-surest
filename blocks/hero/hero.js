import { createElement } from '../../scripts/scripts.js';

/**
 * decorate the hero
 * @param {Element} hero the hero block element
 */
export default function decorate(hero) {
  const textContainer = hero.querySelector('h1').closest('div');
  textContainer.classList.add('hero-text-container');

  const pic = hero.querySelector('picture');
  if (pic) {
    const heroMedia = createElement('div', 'hero-media-wrapper');
    heroMedia.append(pic);
    hero.prepend(heroMedia);

    textContainer.classList.add('hero-has-media');
  }
}
