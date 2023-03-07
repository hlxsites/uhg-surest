import { loadScript } from '../../scripts/scripts.js';
import { readBlockConfig, fetchPlaceholders } from '../../scripts/lib-franklin.js';

function fireSegmentEvent() {

}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);

  const placeholders = await fetchPlaceholders();
  const formId = cfg['form-id'];
  //const { munchkinId } = placeholders;
  const munchkinId = '646-FXB-772';
  const redirectUrl = cfg.redirect || placeholders.formRedirect;

  block.innerHTML = `<form id="mktoForm_${formId}"></form>`;
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://go.yourbind.com/js/forms2/js/forms2.min.js', '', () => {
        // eslint-disable-next-line no-undef
        MktoForms2.loadForm(
          'https://go.yourbind.com',
          munchkinId,
          formId,
          (form) => {
            if (form) {
              form.onSubmit(fireSegmentEvent);
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: 'mkto_form_submit',
                eventCallback: () => {
                  window.location.pathname = redirectUrl;
                },
              });
            }
            return false;
          },
        );
      });
    }
  });
  observer.observe(block);
}
