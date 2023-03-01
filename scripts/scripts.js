import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  readBlockConfig,
  toClassName,
  toCamelCase,
  decorateBlock,
} from './lib-franklin.js';

/* START lib-franklin overrides/extensionts */

/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 */
export function decorateBlocks(main) {
  main
    .querySelectorAll('div.section > div > div > div')
    .forEach(decorateBlock);
}

/**
 * Decorates all sections in a container element.
 * @param {Element} $main The container element
 */
export function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    // custom add a section container
    const container = document.createElement('div');
    container.className = 'section-container';
    [...section.children].forEach((child) => {
      container.append(child);
    });
    section.append(container);

    const wrappers = [];
    let defaultContent = false;
    [...container.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => container.append(wrapper));
    section.classList.add('section');
    section.setAttribute('data-section-status', 'initialized');

    /* process section metadata */
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta.style.split(',').map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

/* END lib-franklin overrides/extensionts */

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

/**
 * Check if two elements exist and are adjacent to each other in any order
 * @param {*} elem1 First element to evaluate
 * @param {*} elem2 Second element to evaluate
 * @returns False if either element does not exist or are not adjacent, otherwise true
 */
function isAdjacent(elem1, elem2) {
  if (!elem1 || !elem2) {
    return false;
  }
  return elem1.nextElementSibling === elem2 || elem1.previousElementSibling === elem2;
}

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  if (!h1) {
    return;
  }
  const subhead = main.querySelector('h2') || main.querySelector('h3') || main.querySelector('h4');
  const picture = main.querySelector('picture');
  const elems = [];
  if (isAdjacent(h1, picture.parentElement)) {
    elems.push(picture);
  }
  elems.push(h1);
  if (isAdjacent(h1, subhead) || isAdjacent(picture.parentElement, subhead)) {
    elems.push(subhead);
  }
  if (elems.length > 0) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  // link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/icons/favicon.png`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
