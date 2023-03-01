import { readBlockConfig, decorateIcons, decorateButtons } from '../../scripts/lib-franklin.js';

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
    const footer = document.createElement('div');
    footer.innerHTML = html;

    const classes = ['logo', 'text', 'buttons', 'links', 'social', 'legal', 'disclaimer'];
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
    block.append(footer);
  }
}
