import { createElement } from '../../scripts/scripts.js';

function decorateBlogHeader(block) {
  const date = document.querySelector('meta[name="date"]');
  const author = document.querySelector('meta[name="author"]');
  const tag = document.querySelector('meta[property="article:tag"]');
  const blogDescription = createElement('div', 'blog-description');
  const blogAuthor = createElement('p', 'blog-author');
  blogAuthor.textContent = author.content;
  const blogDate = createElement('p', 'blog-date');
  blogDate.textContent = date.content;
  const blogTag = createElement('p', 'blog-tag');
  blogTag.textContent = tag.content;
  blogDescription.appendChild(blogAuthor);
  const separator = createElement('p', 'description-separator');
  separator.textContent = '•';
  blogDescription.appendChild(separator.cloneNode(true));
  blogDescription.appendChild(blogDate);
  blogDescription.appendChild(separator.cloneNode(true));
  blogDescription.appendChild(blogTag);
  const blogHeaderWrapper = createElement('div', 'blog-header');
  blogHeaderWrapper.appendChild(block.children[0]);
  blogHeaderWrapper.appendChild(blogDescription);
  block.appendChild(blogHeaderWrapper);
}

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
    if (document.querySelector('meta[name="template"][content="Blog Post"]')) {
      decorateBlogHeader(hero);
      hero.append(heroMedia);
    } else {
      hero.prepend(heroMedia);
    }

    textContainer.classList.add('hero-has-media');
  }
}
