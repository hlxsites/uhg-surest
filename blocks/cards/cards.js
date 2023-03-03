import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

function addLinksToNewsCards(block) {
  [...block.firstChild.children].forEach((card) => {
    const cardBody = card.children[1];
    const link = cardBody.querySelector('p');
    const linkWrapper = createElement('a');
    linkWrapper.href = link.textContent;
    link.remove();
    linkWrapper.appendChild(card.children[0].cloneNode(true));
    linkWrapper.appendChild(card.children[1].cloneNode(true));
    card.children[1].remove();
    card.children[0].remove();
    card.appendChild(linkWrapper);
  });
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = createElement('ul');
  [...block.children].forEach((row) => {
    const li = createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  /* add links for news cards */
  if (block.className === 'cards news block') {
    addLinksToNewsCards(block);
  }
}
