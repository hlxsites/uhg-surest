import { decorateIcons } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

function changeSlide(direction, block, inner) {
  const active = Number(block.dataset.activeSlide);
  const slides = block.querySelectorAll('.carousel-slide');
  const totalSlides = [...slides].length;
  let moveTo = active + direction;
  if (moveTo < 0) moveTo = (totalSlides - 1);
  if (moveTo >= totalSlides) moveTo = 0;

  const indicators = block.querySelectorAll('.slide-indicator');
  if (indicators.length > 0) {
    block.querySelector('.slide-indicator.selected').classList.remove('selected');
    indicators[moveTo].classList.add('selected');
  }

  block.dataset.activeSlide = moveTo;
  const toSlide = block.querySelector(`.carousel-slide:nth-child(${moveTo + 1})`);
  inner.scrollTo({ top: 0, left: toSlide.offsetLeft - toSlide.parentNode.offsetLeft, behavior: 'smooth' });
}

export default async function decorate(block) {
  const inner = createElement('div', 'carousel-inner');
  const indicators = createElement('div', 'carousel-slide-indicators');

  [...block.children].forEach((row, i) => {
    row.classList.add('carousel-slide');
    inner.append(row);
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      if (row.children[j]) row.children[j].classList.add(`carousel-${e}`);
    });

    const slideIndicator = createElement('div', 'slide-indicator');
    if (i === 0) {
      slideIndicator.classList.add('selected');
    }
    slideIndicator.addEventListener('click', () => {
      block.dataset.activeSlide = i;
      changeSlide(0, block, inner);
    });
    indicators.append(slideIndicator);
  });
  inner.append(indicators);

  const buttons = createElement('div', 'carousel-buttons');
  const buttonPrev = createElement('span', ['icon', 'icon-arrow-left', 'carousel-button', 'carousel-button-prev'], {
    'aria-label': 'Previous Slide',
    role: 'button',
  });
  buttonPrev.addEventListener('click', () => {
    changeSlide(-1, block, inner);
  });
  const buttonNext = createElement('span', ['icon', 'icon-arrow-right', 'carousel-button', 'carousel-button-next'], {
    'aria-label': 'Next Slide',
    role: 'button',
  });
  buttonNext.addEventListener('click', () => {
    changeSlide(1, block, inner);
  });
  window.addEventListener('resize', () => {
    changeSlide(0, block, inner);
  });
  buttons.append(buttonPrev);
  buttons.append(buttonNext);
  decorateIcons(buttons);
  block.dataset.activeSlide = '0';
  inner.append(buttons);

  block.append(inner);

  if (block.classList.contains('stats')) {
    const topAnimator = createElement('div', ['animator', 'animator-top', 'stage1']);
    const bottomAnimator = createElement('div', ['animator', 'animator-bottom', 'stage1']);
    block.append(topAnimator);
    block.append(bottomAnimator);

    setInterval(() => {
      changeSlide(1, block, inner);
      topAnimator.classList.toggle('stage1');
      topAnimator.classList.toggle('stage2');
      bottomAnimator.classList.toggle('stage1');
      bottomAnimator.classList.toggle('stage2');
    }, 2000);
  }
}
