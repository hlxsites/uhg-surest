import { createElement } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function getUniqueTags(pages) {
  const tags = new Set();
  for (let i = 0; i < pages.data.length; i += 1) {
    const tagList = JSON.parse(pages.data[i].tags);
    for (let j = 0; j < tagList.length; j += 1) {
      tags.add(tagList[j]);
    }
  }
  return tags;
}

function filter(event) {
  const button = event.target.closest('button');
  if (button.className.includes('active')) {
    button.className = button.className.replace(' active', '');
  } else {
    button.className += ' active';
  }

  const cards = document.querySelectorAll('.cards.blog.block > ul > li');
  const activeTags = [...document.querySelectorAll('.blog-filter .button.secondary.active')].map((tagEl) => tagEl.querySelector('.button-text').textContent);

  cards.forEach((card) => {
    // first, just unhide all
    card.classList.remove('hidden');
    const cardTags = [...card.querySelectorAll('p.blog-tag')].map((tagEl) => tagEl.textContent.replace(',', ''));
    const some = cardTags.some((cardTag) => activeTags.find((activeTag) => activeTag === cardTag));
    if (!some) {
      // rehide the ones we need to
      card.classList.add('hidden');
    }
  });
  button.blur();
}

export default async function decorate(block) {
  const resp = await fetch('/query-index.json');
  if (resp.ok) {
    const pages = await resp.json();
    const tags = getUniqueTags(pages);
    tags.forEach((tag) => {
      const button = createElement('button', ['button', 'secondary']);
      const buttonText = createElement('p', 'button-text');
      const close = createElement('span', ['icon', 'icon-close']);

      button.onclick = filter;
      buttonText.textContent = tag;
      button.appendChild(buttonText);
      button.appendChild(close);
      block.appendChild(button);
    });
    decorateIcons(block);
  }
}
