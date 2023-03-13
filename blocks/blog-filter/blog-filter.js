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

  const cards = document.querySelector('.cards.blog.block > ul');
  let activeTags = document.querySelectorAll('.blog-filter .button.secondary.active');
  if (activeTags.length === 0) {
    activeTags = document.querySelectorAll('.blog-filter .button.secondary');
  }
  for (let j = 0; j < cards.children.length; j += 1) {
    for (let i = 0; i < activeTags.length; i += 1) {
      const tagResults = Array.from(cards.children[j].querySelectorAll('p.blog-tag')).find((card) => card.textContent.replace(',', '') === activeTags[i].textContent);
      if (tagResults) {
        cards.children[j].className = cards.children[j].className.replace(' hidden', '');
        break;
      } else if (!cards.children[j].className.includes(' hidden')) {
        cards.children[j].className += ' hidden';
      }
    }
  }
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
      const x = createElement('span', ['icon', 'icon-x']);

      button.onclick = filter;
      buttonText.textContent = tag;
      button.appendChild(buttonText);
      button.appendChild(x);
      block.appendChild(button);
    });
    decorateIcons();
  }
}
