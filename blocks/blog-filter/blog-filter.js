import { createElement } from '../../scripts/scripts.js';

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
  // set the button's active state
  if (event.target.className.includes('active')) {
    event.target.className = event.target.className.replace(' active', '');
  } else {
    event.target.className += ' active';
  }

  const cards = document.querySelector('.cards.blog.block > ul');
  let activeTags = document.querySelectorAll('.blog-filter .button.primary.active');
  if (activeTags.length === 0) {
    activeTags = document.querySelectorAll('.blog-filter .button.primary');
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
}


export default async function decorate(block) {
  const resp = await fetch('/query-index.json');
  if (resp.ok) {
    const pages = await resp.json();
    const tags = getUniqueTags(pages);
    tags.forEach((tag) => {
      const button = createElement('a', ['button', 'primary']);
      button.onclick = filter;
      button.textContent = tag;
      block.appendChild(button);
    });
    console.log(tags);
    console.log(block);
  }
}
