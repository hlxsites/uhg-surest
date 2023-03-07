export default function decorate(block) {
  const section = block.closest('.section');
  const highlightClasses = ['highlight', 'highlight-grey', 'highlight-purple', 'highlight-dark-purple'];
  const found = [...section.classList].some((cls) => highlightClasses.indexOf(cls) >= 0);
  if (!found) {
    const highlightClass = block.classList.contains('narrow') ? 'highlight-dark-purple' : 'highlight-purple';
    section.classList.add(highlightClass);
  }

  if (block.classList.contains('narrow')) {
    section.classList.add('cta-narrow-container');
  }
}
