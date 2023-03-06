import { decorateIcons } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

function changeSlide(direction, block) {
  const active = Number(block.dataset.activeSlide);
  const indicators = block.querySelectorAll('.slide-indicator');
  const totalSlides = [...indicators].length;
  let moveTo = active + direction;
  if (moveTo < 0) moveTo = (totalSlides - 1);
  if (moveTo >= totalSlides) moveTo = 0;

  block.querySelector('.slide-indicator.selected').classList.remove('selected');
  indicators[moveTo].classList.add('selected');
  block.dataset.activeSlide = moveTo;
  const toSlide = block.querySelector(`.carousel-slide:nth-child(${moveTo + 1})`);
  block.scrollTo({ top: 0, left: toSlide.offsetLeft - toSlide.parentNode.offsetLeft, behavior: 'smooth' });
}

export default async function decorate(block) {
  const indicators = createElement('div', 'carousel-slide-indicators');

  [...block.children].forEach((row, i) => {
    row.classList.add('carousel-slide');
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      if (row.children[j]) row.children[j].classList.add(`carousel-${e}`);
    });

    const slideIndicator = createElement('div', 'slide-indicator');
    if (i === 0) {
      slideIndicator.classList.add('selected');
    }
    indicators.append(slideIndicator);
  });
  block.append(indicators);

  const buttons = createElement('div', 'carousel-buttons');
  const buttonPrev = createElement('span', ['icon', 'icon-arrow-left', 'carousel-button', 'carousel-button-prev'], {
    'aria-label': 'Previous Slide',
    role: 'button',
  });
  buttonPrev.addEventListener('click', () => {
    changeSlide(-1, block);
  });
  const buttonNext = createElement('span', ['icon', 'icon-arrow-right', 'carousel-button', 'carousel-button-next'], {
    'aria-label': 'Next Slide',
    role: 'button',
  });
  buttonNext.addEventListener('click', () => {
    changeSlide(1, block);
  });
  window.addEventListener('resize', () => {
    changeSlide(0, block);
  });
  buttons.append(buttonPrev);
  buttons.append(buttonNext);
  decorateIcons(buttons);
  block.append(buttons);
  block.dataset.activeSlide = '0';
}
