import { getOptions } from './utility/jsTools.js';
import { style, s } from './utility/style.js';

const styleElement = style('');

const run = ({ width, justify }) => {
  styleElement.innerText = `
    ${s('main')} { max-width: ${width}px !important; }
    ${s('postColumn')} { max-width: ${width}px !important; }
    #base-container[data-navigation="horizontal"] {
      ${s('mainContentWrapper')} { width: 100%; }
      [data-css~="container"] { justify-content: ${justify}; }
    }
    #base-container:not([data-navigation="horizontal"]) {
      ${s('mainContentWrapper')} { width: ${width + 370}px; }
      ${s('bluespaceLayout')} > ${s('newDesktopLayout')} { justify-content: ${justify}; }
    }
  `;

};

export const main = async () => {
  const preferences = await getOptions('contentWizard');
  run(preferences);

  document.head.append(styleElement);
};

export const clean = async () => styleElement.remove();

export const update = async preferences => run(preferences);