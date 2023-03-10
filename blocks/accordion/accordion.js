import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const sections = createElement('div');
  [...block.children].forEach((row) => {
    const section = createElement('details');
    const details = row.children[1];
    details.classList.add('details');
    const sectionSummary = createElement('summary');
    sectionSummary.innerHTML = row.children[0].innerHTML;
    section.append(sectionSummary);
    section.append(details);
    sections.append(section);
    row.remove();
  });
  block.append(sections);
}
