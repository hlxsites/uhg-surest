import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const mobileNav = document.getElementById('movile-nav-menu');
    const navSectionExpanded = mobileNav.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections();
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, mobileNav, false);
      nav.querySelector('button').focus();
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
    navSection.addEventListener('click', () => {
      const expanded = navSection.getAttribute('aria-expanded') === 'true';
      toggleAllNavSections(navSections);
      navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    const hr = document.createElement('hr');
    navSection.append(hr);
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
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const mobileMenu = document.createElement('nav');
    mobileMenu.id = 'movile-nav-menu';

    const cover = document.createElement('div');
    cover.className = 'mobile-menu-cover';
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
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
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

    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    navWrapper.append(mobileMenu);

    block.append(navWrapper);
  }
}
