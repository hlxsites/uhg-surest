import { createElement } from '../../scripts/scripts.js';

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
}
