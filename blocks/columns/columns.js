import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (block.classList.contains('split-highlight')) {
    block.closest('.section').classList.add('split-highlight-columns-container');
  }

  const subBlocks = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // setup embed
      const link = col.querySelector('a');
      if (link) {
        const linkWrapper = link?.closest('div');
        if (linkWrapper && linkWrapper.children.length === 1) {
          const linkUrl = new URL(link.href);
          let linkTextUrl;
          try {
            linkTextUrl = new URL(link.textContent);
          } catch {
            // not a url, ignore
          }
          if (linkTextUrl && linkTextUrl.pathname === linkUrl.pathname) {
            const fragmentDomains = ['localhost', 'www.surest.com', '/main--uhg-surest--hlxsites.hlx.page', '/main--uhg-surest--hlxsites.hlx.live'];
            if (fragmentDomains.includes(linkUrl.hostname)) {
              // fragment or video
              if (linkUrl.pathname.includes('.mp4')) {
                // video
                const videoBlock = buildBlock('video', [['Source', link]]);
                linkWrapper.append(videoBlock);
                decorateBlock(videoBlock);
                subBlocks.push(videoBlock);
              } else {
                // fragment
                const fragmentBlock = buildBlock('fragment', [['Source', link]]);
                linkWrapper.append(fragmentBlock);
                decorateBlock(fragmentBlock);
                subBlocks.push(fragmentBlock);
              }
            } else {
              const embedBlock = buildBlock('Embed', [['Source', link]]);
              linkWrapper.append(embedBlock);
              linkWrapper.classList.add('columns-img-col');
              decorateBlock(embedBlock);
              subBlocks.push(embedBlock);
            }
          }
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
