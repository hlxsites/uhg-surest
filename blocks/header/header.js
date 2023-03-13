import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { createElement, createOptimizedPicture } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

let qeData;
async function execSearch(query, resultsContainer) {
  if (!qeData) {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const json = await resp.json();
      qeData = json.data;
    }
  }

  resultsContainer.innerHTML = '';
  if (query.length >= 3) {
    const results = qeData
      .filter((page) => (!page.robots || !page.robots.toLowerCase().includes('noindex')) && page.content.includes(query))
      .sort((pageA, pageB) => pageB.lastModified - pageA.lastModified);

    const ul = createElement('ul');
    if (results.length === 0) {
      const li = createElement('li', 'no-results');
      li.innerHTML = `
          <div class="result-text">
            <h5>No Results</h5>
          </div>
      `;
      ul.append(li);
    }

    results.forEach((result) => {
      const li = createElement('li');
      const pic = createOptimizedPicture(result.image, '', false, [{ dimensions: [{ width: '750' }] }]);
      li.innerHTML = `
          <div class="result-img"><a href="${result.path}">${pic.outerHTML}</a></div>
          <div class="result-text">
            <h5><a href="${result.path}">${result.title}</a></h5>
            <p><a href="${result.path}">${result.description}</a></p>
          </div>
      `;
      ul.append(li);
    });

    resultsContainer.append(ul);
  }
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const mobileNav = document.getElementById('movile-nav-menu');
    if (isDesktop.matches) {
      const navSectionExpanded = nav.querySelector('[aria-expanded="true"]');
      if (navSectionExpanded) {
        // eslint-disable-next-line no-use-before-define
        toggleAllNavSections(nav);
        navSectionExpanded.focus();
      }
    } else {
      const navSectionExpanded = mobileNav.querySelector('[aria-expanded="true"]');
      if (navSectionExpanded) {
        // eslint-disable-next-line no-use-before-define
        toggleAllNavSections(mobileNav);
        navSectionExpanded.focus();
      } else {
        // eslint-disable-next-line no-use-before-define
        toggleMenu(nav, mobileNav, false);
        nav.querySelector('button').focus();
      }
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function initNavSections(navSections) {
  navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
    if (navSection.querySelector('ul')) {
      navSection.classList.add('nav-drop');
      // enable nav dropdown keyboard accessibility
      navSection.setAttribute('role', 'button');
      navSection.setAttribute('tabindex', 0);
      navSection.addEventListener('focus', focusNavSection);
    }
  });
}

function initMobileNavSections(navSections) {
  navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
    if (navSection.classList.contains('nav-drop')) {
      navSection.addEventListener('click', () => {
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    }

    const hr = createElement('hr');
    navSection.append(hr);
  });
}

function initDesktopNavSections(navSections) {
  navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
    const navLink = navSection.querySelector(':scope > a');
    if (navLink.href.endsWith(window.location.pathname)) {
      navSection.classList.add('perma-selected');
    }
    navSection.addEventListener('mouseenter', () => {
      if (navSection.classList.contains('nav-drop')) {
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      }
      navSection.classList.add('selected');
    });
    navSection.addEventListener('mouseleave', () => {
      if (navSection.classList.contains('nav-drop')) {
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      }
      navSection.classList.remove('selected');
    });
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The nav element
 * @param {Element} mobileNav The nav element for the mobile menu
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, mobileNav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : mobileNav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded ? '' : 'hidden';
  mobileNav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  mobileNav.setAttribute('aria-hidden', expanded ? 'true' : 'false');
  toggleAllNavSections(mobileNav.querySelector('.nav-sections'), 'false');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (!expanded) {
    nav.classList.add('expanded');
  } else {
    nav.classList.remove('expanded');
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch nav content
  const navPath = getMetadata('nav') || '/nav';
  const resp = await fetch(`${navPath}.plain.html`, window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = createElement('nav', '', {
      id: 'nav',
    });
    nav.innerHTML = html;

    const mobileMenu = createElement('nav', '', {
      id: 'movile-nav-menu',
    });

    const cover = createElement('div', 'mobile-menu-cover');
    mobileMenu.append(cover);

    const classes = ['brand', 'tools', 'sections'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      const mobileNavSections = navSections.cloneNode(true);
      mobileMenu.append(mobileNavSections);
      initNavSections(mobileNavSections);
      initMobileNavSections(mobileNavSections);
      initNavSections(navSections);
      initDesktopNavSections(navSections);
    }

    const navTools = nav.querySelector('.nav-tools');
    if (navTools) {
      navTools.querySelectorAll(':scope > ul > li').forEach((navTool) => {
        const link = navTool.querySelector('a');
        if (link) {
          navTool.classList.add('nav-item');
          const secondary = navTool.querySelector('em');
          if (secondary) {
            navTool.classList.add('nav-item-secondary');
          } else {
            navTool.classList.add('nav-item-primary');
            link.classList.add('button', 'primary');
          }
        }
      });
      mobileMenu.append(navTools.cloneNode(true));
    }

    // hamburger for mobile
    const hamburger = createElement('div', 'nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="movile-nav-menu" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, mobileMenu));
    nav.querySelector('.nav-brand').append(hamburger);
    // prevent mobile nav behavior on window resize
    isDesktop.addEventListener('change', () => toggleMenu(nav, mobileMenu, false));
    toggleMenu(nav, mobileMenu, false);
    window.addEventListener('keydown', closeOnEscape);

    decorateIcons(nav);
    decorateIcons(mobileMenu);

    const navWrapper = createElement('div', 'nav-wrapper');
    navWrapper.append(nav);
    navWrapper.append(mobileMenu);

    block.append(navWrapper);

    const seachDialog = createElement('dialog', 'search-dialog');
    seachDialog.innerHTML = `
      <div class="search-dialog-form-container">
        <span class="icon icon-search"></span>
        <form>
          <input type="text" placeholder="Search surest.com" class="search-input" value=""></input>
        </form>
        <span class="icon icon-close"></span>
      </div>
      <div class="search-dialog-results-container">
      </div>
    `;
    const searchInput = seachDialog.querySelector('.search-input');
    searchInput.addEventListener('keyup', () => {
      const q = searchInput.value;
      execSearch(q, seachDialog.querySelector('.search-dialog-results-container'));
    });
    seachDialog.querySelector('.icon-close').addEventListener('click', () => {
      seachDialog.close();
    });
    decorateIcons(seachDialog);
    block.append(seachDialog);
    block.querySelectorAll('.icon-search').forEach((srch) => {
      srch.addEventListener('click', () => {
        seachDialog.show();
      });
    });
  }
}
