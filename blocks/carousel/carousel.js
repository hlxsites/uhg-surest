import { createElement } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const indicators = createElement('div', 'carousel-slide-indicators');

  [...block.children].forEach((row, i) => {
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
  const buttonPrev = createElement('div', ['carousel-button', 'carousel-button-prev'], {
    'aria-label': 'Previous Slide',
    role: 'button',
  });
  const buttonNext = createElement('div', ['carousel-button', 'carousel-button-next'], {
    'aria-label': 'Next Slide',
    role: 'button',
  });
  buttons.append(buttonPrev);
  buttons.append(buttonNext);
  block.append(buttons);
  block.classList.add('appear');
}
