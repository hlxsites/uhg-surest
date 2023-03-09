import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const sections = createElement('div');
  [...block.children].forEach((row) => {
    const section = createElement('details');
    const sectionSummary = createElement('summary');
    const summary = row.children[0];
    const details = row.children[1];
    [...summary.children].forEach((child) => sectionSummary.append(child));
    section.append(sectionSummary);
    [...details.children].forEach((child) => section.append(child));
    sections.append(section);
    row.remove();
  });
  block.append(sections);
}
