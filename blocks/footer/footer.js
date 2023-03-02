import { readBlockConfig, decorateIcons, decorateButtons } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  if (resp.ok) {
    const html = await resp.text();
    const footer = createElement('div', 'footer-block');
    footer.innerHTML = html;

    const classes = ['logo-small-screen', 'text', 'buttons', 'logo-large-screen', 'links', 'social', 'legal', 'disclaimer'];
    classes.forEach((c, i) => {
      const section = footer.children[i];
      if (section) section.classList.add(`footer-${c}`);
    });

    const legalClasses = ['legal', 'privacy', 'security'];
    await decorateIcons(footer);
    await decorateButtons(footer.querySelector('.footer-buttons'));
    legalClasses.forEach((c, i) => {
      const section = footer.querySelector('.footer-legal').children[i];
      if (section) section.classList.add(`${c}`);
    });

    // Set up main footer columns
    const column1 = createElement('div', 'footer-column1');
    const column2 = createElement('div', 'footer-column2');

    column1.appendChild(footer.querySelector('.footer-logo-small-screen'));
    column1.appendChild(footer.querySelector('.footer-text'));
    column1.appendChild(footer.querySelector('.footer-buttons'));
    column1.appendChild(footer.querySelector('.footer-logo-large-screen'));

    column2.appendChild(footer.querySelector('.footer-links'));
    column2.appendChild(footer.querySelector('.footer-social'));
    column2.appendChild(footer.querySelector('.footer-legal'));
    column2.appendChild(footer.querySelector('.footer-disclaimer'));

    footer.appendChild(column1);
    footer.appendChild(column2);

    // Set up link columns
    const footerLinks = footer.querySelector('.footer-links');
    const footerLinksColumns = createElement('div', 'footer-links');
    const linksColumn1 = createElement('div', 'links-column1');
    const linksColumn2 = createElement('div', 'links-column2');
    for (let i = 0; i < 5; i += 1) {
      linksColumn1.appendChild(footerLinks.children[i].cloneNode(true));
    }
    for (let i = 5; i < 10; i += 1) {
      linksColumn2.appendChild(footerLinks.children[i].cloneNode(true));
    }
    footerLinks.remove();

    footerLinksColumns.appendChild(linksColumn1);
    footerLinksColumns.appendChild(linksColumn2);
    column2.insertBefore(footerLinksColumns, column2.querySelector('.footer-social'));

    block.append(footer);
  }
}
