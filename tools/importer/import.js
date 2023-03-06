/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

function getBlogPost(document) {
  const meta = {
    Template: 'Blog Post',
  };
  const main = document.querySelector('main');
  main.querySelector('.blog-header-back-link').remove();
  const tagBlock = main.querySelector('.blog-tag-block');
  tagBlock.querySelectorAll('.blog-tag-block-bullet').forEach((bullet) => bullet.remove());
  tagBlock.querySelectorAll('.blog-tag-block-item').forEach((tagItem, i) => {
    if (i === 0) {
      meta.Author = tagItem.textContent;
    } else if (i === 1) {
      const d = new Date(tagItem.textContent);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1) < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
      const day = (d.getDate()) < 10 ? `0${d.getDate()}` : d.getDate();
      meta.Date = `${year}/${month}/${day}`;
    } else if (i === 2) {
      meta.Tags = tagItem.textContent;
    }
  });
  tagBlock.remove();

  const heroImg = document.querySelector('.blog-featured-image');
  const sectionBreak = document.createElement('p');
  sectionBreak.innerHTML = '---';
  heroImg.append(sectionBreak);
  meta.Image = heroImg.querySelector('img').cloneNode(true);

  meta.Title = main.querySelector('h1').textContent;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  } else {
    meta.Description = main.querySelector('.blog-body p').textContent;
  }

  main.querySelector('.blog-body').append(sectionBreak.cloneNode(true));

  const relatedBlogs = main.querySelector('.related-blogs-container');
  relatedBlogs.remove();
  const h3 = document.createElement('h3');
  h3.textContent = 'You may also like...';
  main.append(h3);

  const cells = [
    ['Blog Cards (related)'],
    ['limit', '3'],
  ];
  const postCardsBlock = WebImporter.DOMUtils.createTable(cells, document);
  main.append(postCardsBlock);

  const metaBlock = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(metaBlock);

  return main;
}

export default {
  /**
   * Apply DOM operations to the provided document and return an array of
   * objects ({ element: HTMLElement, path: string }) to be transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {Array} The { element, path } pairs to be transformed
   */
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const urlObject = new URL(params.originalURL);
    let el = document.querySelector('main');
    if (urlObject.pathname.startsWith('/blog/')) {
      el = getBlogPost(document);
    }

    return [{
      element: el,
      path: urlObject.pathname,
    }];
  },
};
