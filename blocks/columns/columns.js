import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const subBlocks = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // setup embed
      const link = col.querySelector('a');
      const linkWrapper = link?.closest('div');
      if (link && link.href === link.textContent) {
        if (linkWrapper && linkWrapper.children.length === 1) {
          const embedBlock = buildBlock('Embed', [['Source', link]]);
          linkWrapper.append(embedBlock);
          linkWrapper.classList.add('columns-img-col');
          decorateBlock(embedBlock);
          subBlocks.push(embedBlock);
        }
      } else if (link) {
        const linkUrl = new URL(link.href);
        const fragmentDomains = ['localhost', 'www.surest.com', '/main--uhg-surest--hlxsites.hlx.page', '/main--uhg-surest--hlxsites.hlx.live'];
        if (link.textContent.endsWith(linkUrl.pathname)
          && fragmentDomains.includes(linkUrl.hostname)) {
          const fragmentBlock = buildBlock('fragment', [['Source', link]]);
          linkWrapper.append(fragmentBlock);
          decorateBlock(fragmentBlock);
          subBlocks.push(fragmentBlock);
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

  for (let i = 0; i < subBlocks.length; i += 1) {
    const sb = subBlocks[i];
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(sb);
  }
}
