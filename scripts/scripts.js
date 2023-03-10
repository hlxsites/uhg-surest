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

/**
 * Create an element with the given id and classes.
 * @param {string} tagName the tag
 * @param {string[]|string} classes the class or classes to add
 * @param {object} props any other attributes to add to the element
 * @returns the element
 */
export function createElement(tagName, classes, props) {
  const elem = document.createElement(tagName);
  if (classes) {
    const classesArr = (typeof classes === 'string') ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (props) {
    Object.keys(props).forEach((propName) => {
      elem.setAttribute(propName, props[propName]);
    });
  }

  return elem;
}

function buildSrcSet(dimensions, path, format) {
  let srcset = '';
  dimensions.forEach((dim, i) => {
    if (i > 0) {
      srcset += ', ';
    }
    srcset += `${path}?width=${dim.width}&format=${format}&optimize=medium`;
    if (dim.density) {
      srcset += ` ${dim.density}`;
    }
  });
  return srcset;
}

/* START lib-franklin overrides/extensionts */
/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 400px)', dimensions: [{ width: '2000' }] }, { dimensions: [{ width: '750' }] }]) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const { media, dimensions } = br;
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', media);
    source.setAttribute('type', 'image/webp');
    const srcset = buildSrcSet(dimensions, pathname, 'webply');
    source.setAttribute('srcset', srcset);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    const { media, dimensions } = br;
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', media);
      const srcset = buildSrcSet(dimensions, pathname, ext);
      source.setAttribute('srcset', srcset);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${dimensions[0].width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
}

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
    const container = createElement('div', 'section-container');
    [...section.children].forEach((child) => {
      container.append(child);
    });
    section.append(container);

    const wrappers = [];
    let defaultContent = false;
    [...container.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = createElement('div');
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
        } else if (key === 'background') {
          const picture = createOptimizedPicture(meta[key]);
          picture.classList.add('section-background');
          section.prepend(picture);
          section.dataset[toCamelCase(key)] = meta[key];
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

/* END lib-franklin overrides/extensionts */

const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  if (!h1) {
    return;
  }
  const section = h1.closest('div');
  const elems = [...section.children];
  if (elems.length > 0) {
    section.append(buildBlock('hero', [elems]));
    main.prepend(section);
  }
}

function scrollBackToTop() {
  const pos = -Math.max(window.visualViewport.height - window.scrollY, 0);
  document.querySelector('.back-to-top').style.bottom = `${pos}px`;
}

function buildBackToTop() {
  const toTop = createElement('div', 'back-to-top');
  document.onscroll = scrollBackToTop;
  toTop.onclick = () => window.scrollTo(0, 0);
  toTop.innerHTML = '<span class="icon icon-up-arrow"></span>';
  decorateIcons(toTop);
  document.body.appendChild(toTop);
}
/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildBackToTop();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * load a script by adding to page head
 * @param {string} url the script src url
 * @param {string} type the script type
 * @param {function} callback a funciton to callback after loading
 */
export function loadScript(url, type, callback) {
  const head = document.querySelector('head');
  let script = head.querySelector(`script[src="${url}"]`);
  if (!script) {
    script = document.createElement('script');
    script.src = url;
    if (type) script.setAttribute('type', type);
    head.append(script);
    script.onload = callback;
    return script;
  }
  return script;
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
  const link = createElement('link', '', {
    rel: 'icon',
    href,
  });
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
  window.setTimeout(() => import('./delayed.js'), 4000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
