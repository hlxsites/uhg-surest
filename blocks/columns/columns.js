import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const embedBlocks = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // setup embed
      const link = col.querySelector('a');
      if (link && link.href === link.textContent) {
        const linkWrapper = link.closest('div');
        if (linkWrapper && linkWrapper.children.length === 1) {
          const embedBlock = buildBlock('embed', [['Source', link]]);
          linkWrapper.append(embedBlock);
          decorateBlock(embedBlock);
          embedBlocks.push(embedBlock);
        }
      }

      // setup image columns
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  for (let i = 0; i <= embedBlocks.length; i += 1) {
    const eb = embedBlocks[i];
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(eb);
  }
}
