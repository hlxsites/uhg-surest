import { createElement, createOptimizedPicture } from '../../scripts/scripts.js';

export default async function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('testimonia-inner');
    [...row.children].forEach((col) => {
      const blockquote = col.querySelector('blockquote');
      if (blockquote) {
        col.classList.add('quote-wrapper');
        const quoteInner = createElement('div', 'quote-inner');
        quoteInner.append(...col.children);
        col.append(quoteInner);

        const p = blockquote.querySelector('p');
        const h5 = document.createElement('h5');
        h5.innerHTML = p.innerHTML;
        p.replaceWith(h5);
      }

      const img = col.querySelector('img');
      if (img) {
        col.classList.add('img-wrapper');
      }
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const { src } = img;
    const imgUrl = new URL(src);
    const pic = createOptimizedPicture(imgUrl.pathname, img.alt, false, [
      {
        media: '(min-width: 900px)',
        dimensions: [
          {
            width: '700',
            density: '1x',
          },
          {
            width: '1400',
            density: '2x',
          },
        ],
      },
      {
        dimensions: [
          {
            width: '500',
            density: '1x',
          },
          {
            width: '1000',
            density: '2x',
          },
        ],
      },
    ]);
    img.closest('picture').replaceWith(pic);
  });
}
