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
function addCommonMetadata(document, main, meta) {
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent;
  } else {
    meta.Title = main.querySelector('h1').textContent;
  }

  const desc = document.querySelector('meta[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  } else {
    meta.Description = main.querySelector('.blog-body p').textContent;
  }

  const heroImg = main.querySelector('img');
  if (heroImg) {
    meta.Image = main.querySelector('img').cloneNode(true);
  }
}

async function importPage(document, origHtml) {
  const blockList = new Set();
  const meta = {};
  const main = document.querySelector('main');

  const heroImg = main.querySelector('.hero .image-wrapper');
  WebImporter.DOMUtils.replaceBackgroundByImg(heroImg, document);

  const sectionBreak = document.createElement('p');
  sectionBreak.innerHTML = '---';
  main.querySelector('.hero')?.append(sectionBreak);

  main.querySelectorAll('iframe').forEach(async (iFrame) => {
    let { src } = iFrame;
    if (!src.startsWith('http')) {
      src = `https:${src}`;
    }

    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;

    if (src.includes('ceros.com')) {
      blockList.add('Embed (Ceros)');
    } else {
      blockList.add('Embed');
    }

    if (iFrame.closest('.text-with-image')) {
      iFrame.replaceWith(a);
    } else {
      const blockCells = [
        ['Embed'],
      ];
      const row = ['Source', a];
      blockCells.push(row);
      const block = WebImporter.DOMUtils.createTable(blockCells, document);
      iFrame.replaceWith(block);
    }
  });

  main.querySelectorAll('.proof-bank-ul').forEach((images) => {
    blockList.add('Images');
    const blockCells = [
      ['Images'],
    ];

    images.querySelectorAll('li').forEach((li) => {
      const row = [];
      row.push(li.querySelector('img'));
      blockCells.push(row);
    });

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    images.replaceWith(block);
  });

  main.querySelectorAll('.card-grid').forEach((cards) => {
    blockList.add('Cards');
    const blockCells = [
      ['Cards'],
    ];

    cards.querySelectorAll('.card-inner').forEach((card) => {
      const cardStuff = [];

      cardStuff.push(card.querySelector('.image-wrapper'));
      cardStuff.push(card.querySelector('.text-wrapper'));

      blockCells.push(cardStuff);
    });

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    cards.replaceWith(block);
  });

  main.querySelectorAll('.featured-content-block').forEach((cards) => {
    blockList.add('Cards (featured)');
    const blockCells = [
      ['Cards (featured)'],
    ];

    const headline = cards.querySelector('.heading-wrapper');
    if (headline) {
      cards.insertAdjacentElement('beforebegin', headline);
    }

    const cardStuff = document.createElement('div');
    cards.querySelectorAll('.featured-content-item-wrapper').forEach((card) => {
      const cardP = document.createElement('p');
      const link = card.querySelector('a').cloneNode(false);
      let linkTo = link.href;
      if (linkTo.startsWith('/')) {
        linkTo = `https://main--uhg-surest--hlxsites.hlx.page${linkTo}`;
      }
      link.textContent = linkTo;
      link.href = linkTo;
      cardP.append(link);
      cardStuff.append(cardP);
    });
    blockCells.push([cardStuff]);

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    cards.replaceWith(block);
  });

  main.querySelectorAll('.article-link-block').forEach((newsBlock) => {
    blockList.add('Cards (news)');
    const blockCells = [
      ['Cards (news)'],
    ];

    const headline = newsBlock.querySelector('.heading-wrapper');
    if (headline) {
      newsBlock.insertAdjacentElement('beforebegin', headline);
    }

    newsBlock.querySelectorAll('.articles-wrapper > .link-wrapper').forEach((articleCard) => {
      const row = [];

      const img = articleCard.querySelector('.image-outer-wrapper');
      img.style.display = 'block';
      row.push(img);
      const text = articleCard.querySelector('.article-text-wrapper');
      const link = articleCard.querySelector('a').cloneNode(false);
      link.textContent = link.href;
      text.prepend(link);
      row.push(text);

      blockCells.push(row);
    });

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    newsBlock.replaceWith(block);
  });

  main.querySelectorAll('.split-block').forEach((split) => {
    blockList.add('Columns (split-highlight)');
    [...split.children].forEach((splitItem) => {
      const blockCells = [
        ['ContentWrapper'],
        [splitItem],
      ];
      const block = WebImporter.DOMUtils.createTable(blockCells, document);
      split.append(block);
    });
  });

  main.querySelectorAll('.testimonial').forEach((testimonial) => {
    blockList.add('Testimonial');
    const blockCells = [
      ['Testimonial'],
    ];

    const row = [...testimonial.querySelector('.inner-wrapper').children];
    blockCells.push(row);

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    testimonial.replaceWith(block);
  });

  main.querySelectorAll('.mkto-form').forEach((form) => {
    blockList.add('Marketo Form');
    const blockCells = [
      ['Marketo Form'],
      [...form.children],
    ];

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    form.replaceWith(block);
  });

  main.querySelectorAll('.featured-cta').forEach((cta) => {
    blockList.add('CTA');
    const blockCells = [
      ['CTA'],
    ];

    const row = [...cta.querySelector('.featured-cta--inner-wrapper').children];
    blockCells.push(row);

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    cta.replaceWith(block);
  });

  main.querySelectorAll('.drawers-outer').forEach((accordion) => {
    blockList.add('Accordion');
    const blockCells = [
      ['Accordion'],
    ];

    let foundJson;
    const fakeDoc = document.createElement('div');
    fakeDoc.innerHTML = origHtml;
    const ldJsons = fakeDoc.querySelectorAll('script[type="application/ld+json"]');
    ldJsons.forEach((ldJson) => {
      const json = JSON.parse(ldJson.innerHTML);
      if (json['@type'] === 'FAQPage') {
        foundJson = json;
      }
    });

    const headline = accordion.querySelector('.drawers-headline-wrapper');
    accordion.insertAdjacentElement('beforebegin', headline);

    accordion.querySelectorAll('.drawers-item-wrapper').forEach((item) => {
      const itemCells = [];
      const question = item.querySelector('.drawers-item-wrapper-inner-upper');
      const answer = item.querySelector('.drawers-item-wrapper-inner-lower');
      if (foundJson) {
        foundJson.mainEntity.forEach((entity) => {
          if (entity['@type'] === 'Question' && entity.name === answer.id.replace('drawers-lower-', '')) {
            answer.innerHTML = entity.acceptedAnswer.text;
          }
        });
      }

      itemCells.push(question);
      itemCells.push(answer);

      blockCells.push(itemCells);
    });

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    accordion.replaceWith(block);
  });

  main.querySelectorAll('.event-interrupter').forEach((cta) => {
    blockList.add('CTA (narrow)');
    const blockCells = [
      ['CTA (narrow)'],
    ];

    const row = [...cta.querySelector('.event-interrupter-wrapper').children];
    blockCells.push(row);

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    cta.replaceWith(block);
  });

  main.querySelectorAll('.list-with-icons').forEach((listWithIcons) => {
    blockList.add('Columns (icons)');
    const blockCells = [
      ['Columns (icons)'],
    ];
    const listWrapper = listWithIcons.querySelector('.list-wrapper');
    listWithIcons.querySelectorAll('.icon-list-item').forEach((listItem) => {
      const row = [];
      row.push(listItem.querySelector('.icon-wrapper'));
      row.push(listItem.querySelector('.list-item-body'));
      blockCells.push(row);
    });

    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    listWrapper.replaceWith(block);
  });

  main.querySelectorAll('.text-with-image').forEach((textWithImage) => {
    blockList.add('Columns');
    const colsContent = [];
    const colImage = textWithImage.querySelector('.image-wrapper');
    const colText = textWithImage.querySelector('.text-wrapper');
    colsContent.push(colText);
    colsContent.push(colImage);
    if (colImage.classList.contains('-image-left')) {
      colsContent.reverse();
    }

    const blockCells = [
      ['Columns'],
      colsContent,
    ];
    const block = WebImporter.DOMUtils.createTable(blockCells, document);
    textWithImage.replaceWith(block);
  });

  main.querySelectorAll('.section').forEach((section) => {
    const metdataCells = [
      ['Section Metadata'],
    ];

    const sectionStyle = [];
    if (section.querySelector('.rich-text-section')) {
      sectionStyle.push('Center');
    }

    if (section.querySelector('.split-block')) {
      sectionStyle.push('Columns', 'Split Highlight');
    }

    // background color purple
    if (section.classList.contains('section-color-bg')) {
      if (section.classList.contains('jsx-2489806016')) {
        sectionStyle.push('highlight-purple');
      }
      if (section.classList.contains('jsx-3768660036')) {
        sectionStyle.push('highlight-grey');
      }
      if (section.classList.contains('jsx-2078021124')) {
        sectionStyle.push('highlight-dark-purple');
      }
    }

    if (sectionStyle.length > 0) {
      metdataCells.push(['Style', sectionStyle.join(', ')]);
    }

    if (metdataCells.length > 1) {
      const sectionMetadataBlock = WebImporter.DOMUtils.createTable(metdataCells, document);
      section.append(sectionMetadataBlock);
    }

    section.append(sectionBreak.cloneNode(true));
  });

  addCommonMetadata(document, main, meta);

  const metaBlock = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(metaBlock);

  return {
    el: main,
    report: {
      blocks: Array.from(blockList).join(', '),
    },
  };
}

function importBlogPost(document) {
  const meta = {
    Template: 'Blog Post',
  };
  const main = document.querySelector('main');
  main.querySelector('.blog-header-back-link img').remove();
  const backArrow = document.createElement('p');
  backArrow.textContent = ':arrow-left:';
  main.querySelector('.blog-header-back-link').insertBefore(backArrow, main.querySelector('.blog-header-back-link a'));
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

  addCommonMetadata(document, main, meta);

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
  transform: async ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const urlObject = new URL(params.originalURL);
    let el = document.querySelector('main');
    let report = {};
    if (urlObject.pathname.startsWith('/blog/')) {
      el = importBlogPost(document);
    } else {
      const result = await importPage(document, html);
      el = result.el;
      report = result.report;
    }

    return [{
      element: el,
      path: urlObject.pathname,
      report,
    }];
  },
};
