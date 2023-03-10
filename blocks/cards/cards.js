import { getMetadata } from '../../scripts/lib-franklin.js';
import { createOptimizedPicture, createElement } from '../../scripts/scripts.js';

function createBlogCard(blog) {
  const blogImage = createElement('div');
  const blogPicture = createElement('picture');
  const img = createElement('img');
  img.src = blog.image;
  blogPicture.appendChild(img);
  blogImage.appendChild(blogPicture);
  const blogBody = createElement('div');
  const blogLinkWrapper = createElement('p');
  const blogLink = createElement('a');
  blogLinkWrapper.appendChild(blogLink);
  blogLink.href = blog.path;
  const blogDescription = createElement('div', 'blog-description');
  const blogAuthor = createElement('p', 'blog-author');
  blogAuthor.textContent = getMetadata('author');
  const blogDate = createElement('p', 'blog-date');
  blogDate.textContent = getMetadata('date');
  const blogTags = JSON.parse(blog.tags);
  blogDescription.appendChild(blogAuthor);
  const separator = createElement('p', 'description-separator');
  separator.textContent = '•';
  if (blogDate) {
    blogDescription.appendChild(separator.cloneNode(true));
    blogDescription.appendChild(blogDate);
  }
  if (blogTags.length > 0) {
    blogDescription.appendChild(separator.cloneNode(true));
    blogTags.forEach((tag, index, array) => {
      const blogTag = createElement('p', 'blog-tag');
      blogTag.textContent = tag;
      if (index !== (array.length - 1)) {
        blogTag.textContent += ',';
      }
      blogDescription.appendChild(blogTag);
    });
  }
  const blogTitle = createElement('h3');
  blogTitle.textContent = blog.title;
  blogBody.appendChild(blogLinkWrapper);
  blogBody.appendChild(blogDescription);
  blogBody.appendChild(blogTitle);
  const blogCard = createElement('div');
  blogCard.appendChild(blogImage);
  blogCard.appendChild(blogBody);
  return blogCard;
}

async function getRelatedBlogs(block, limit = 3) {
  while (block.firstChild) {
    block.removeChild(block.lastChild);
  }
  const tagList = getMetadata('article:tag').split(', ');
  const resp = await fetch('/query-index.json');
  if (resp.ok) {
    const json = await resp.text();
    const blogs = JSON.parse(json);
    const relatedBlogList = [];
    for (let i = 0; i < blogs.data.length; i += 1) {
      const tag = tagList.slice(-1)[0];
      const { tags, title } = blogs.data[i];
      if (tags.includes(tag) && getMetadata('og:title') !== title) {
        relatedBlogList.push(blogs.data[i]);
        if (relatedBlogList.length >= limit) {
          break;
        }
      }
    }
    relatedBlogList.forEach((blog) => {
      block.appendChild(createBlogCard(blog));
    });
  }
}

function getBlogLimit(block) {
  return Array.from(block.querySelectorAll('div')).find((el) => el.textContent === 'limit').nextElementSibling.textContent;
}

function addLinksToCards(block) {
  [...block.firstChild.children].forEach((card) => {
    const cardBody = card.children[1];
    const link = cardBody.querySelector('a');
    const { href } = link;
    link.parentElement.remove();
    // eslint-disable-next-line no-return-assign
    card.onclick = () => window.location.href = href;
  });
}

export default async function decorate(block) {
  if (getMetadata('template') === 'Blog Post') {
    await getRelatedBlogs(block, getBlogLimit(block));
  }
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
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ dimensions: [{ width: '750' }] }])));
  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('news') || block.classList.contains('featured') || block.classList.contains('related')) {
    addLinksToCards(block);
  }
}
