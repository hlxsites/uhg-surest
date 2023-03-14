import { createElement } from '../../scripts/scripts.js';
import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

function decorateBlogHeader(block) {
  const blogDescription = createElement('div', 'blog-description');
  const blogAuthor = createElement('p', 'blog-author');
  blogAuthor.textContent = getMetadata('author');
  const blogDate = createElement('p', 'blog-date');
  blogDate.textContent = getMetadata('date');
  const blogTag = createElement('p', 'blog-tag');
  blogTag.textContent = getMetadata('article:tag');
  blogDescription.appendChild(blogAuthor);
  const separator = createElement('p', 'description-separator');
  separator.textContent = '•';
  if (blogDate) {
    blogDescription.appendChild(separator.cloneNode(true));
    blogDescription.appendChild(blogDate);
  }
  if (blogTag) {
    blogDescription.appendChild(separator.cloneNode(true));
    blogDescription.appendChild(blogTag);
  }
  const blogHeaderWrapper = createElement('div', 'blog-header');
  blogHeaderWrapper.appendChild(block.children[0]);
  blogHeaderWrapper.appendChild(blogDescription);
  block.appendChild(blogHeaderWrapper);
  const backButton = createElement('div', 'back-button');
  const leftArrow = createElement('span', ['icon', 'icon-arrow-left']);
  const backButtonText = createElement('p', 'back-button-text');
  const backButtonLink = createElement('a', 'back-button-link');
  backButtonLink.href = ('/blog');
  backButtonLink.textContent = 'All articles';
  backButtonText.appendChild(backButtonLink);
  backButton.appendChild(leftArrow);
  backButton.appendChild(backButtonText);
  const textContainer = block.querySelector('.hero-text-container > div');
  textContainer.insertBefore(backButton, textContainer.querySelector('h1'));
  decorateIcons(block);
}

/**
 * decorate the hero
 * @param {Element} hero the hero block element
 */
export default function decorate(hero) {
  const textContainer = hero.querySelector('h1').closest('div').parentElement;
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
