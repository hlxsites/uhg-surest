import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';
import { createOptimizedPicture } from '../../scripts/scripts.js';

function replacePicture(pic) {
  const img = pic.querySelector('img');
  const { src } = img;
  const imgUrl = new URL(src);
  const newPic = createOptimizedPicture(imgUrl.pathname, img.alt, false, [
    {
      media: '(min-width: 900px)',
      dimensions: [
        {
          width: '1400',
          density: '1x',
        },
        {
          width: '2800',
          density: '2x',
        },
      ],
    },
    {
      dimensions: [
        {
          width: '700',
          density: '1x',
        },
        {
          width: '1400',
          density: '2x',
        },
      ],
    },
  ]);
  pic.replaceWith(newPic);
}

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (block.classList.contains('split-highlight')) {
    block.closest('.section').classList.add('split-highlight-columns-container');
  }

  const subBlocks = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, i) => {
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
            const fragmentDomains = ['localhost', 'surest.com', 'uhg-surest--hlxsites.hlx.page', 'uhg-surest--hlxsites.hlx.live'];
            const found = fragmentDomains.find((domain) => linkUrl.hostname.endsWith(domain));
            if (found) {
              // fragment or video
              if (linkUrl.pathname.includes('.mp4')) {
                // video
                const videoBlock = buildBlock('video', [['Source', link]]);
                linkWrapper.append(videoBlock);
                linkWrapper.classList.add('media-col');
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
              const embedBlock = buildBlock('embed', [['Source', link]]);
              linkWrapper.append(embedBlock);
              linkWrapper.classList.add('media-col');
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
          picWrapper.classList.add('media-col');
          let colImgClass = 'image-left';
          if (i === 1) colImgClass = 'image-right';
          if (!block.classList.contains('icons')) {
            block.classList.add('image-columns', colImgClass);
          }
        }
        replacePicture(pic);
      }
    });
  });

  for (let i = 0; i < subBlocks.length; i += 1) {
    const sb = subBlocks[i];
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(sb);
  }
}
