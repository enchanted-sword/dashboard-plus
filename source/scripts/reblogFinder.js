import { mutationManager, postFunction } from './utility/mutations.js';
import { noteObject } from './utility/reactProps.js';
import { elem, debounce } from './utility/jsTools.js';
import { svgIcon } from './utility/dashboardElements.js';
import { translate } from './utility/tumblr.js';
import { s } from './utility/style.js';

const filters = {
  blogName: /"blogName":"([\w\d]*)"/g,
  reblogParentBlogName: /"reblogParentBlogName":"([\w\d]*)"/g,
  summary: /"summary":"([^"]*)"/g,
  text: /"text":"([^"]*)"/g,
  tags: /"tags":\[((?:"(?:[^"]*)",?)*)\]/g,
};

const hiddenAttribute = 'data-reblog-finder-hidden';
const targetSelector = `button${s('tab likes')}[data-title="Likes"]`;
const searchId = 'dbplus-reblogFinder-search';
const inputId = 'dbplus-reblogFinder-input';

const matchesToString = arr => arr.map(x => x[1]).join(' ');
const reblogQueryFilter = notes => {
  const query = document.getElementById(inputId).value.replace('"', '\'').toLowerCase();
  console.log(`searching notes with query "${query}"`);
  notes.forEach(async note => {
    let filterString = note.__reblogFinderFilter;

    if (typeof note.__reblogFinderFilter === 'undefined') {
      const str = JSON.stringify(await noteObject(note))
        .replace(/\\"/g, '\'').replace(/"descriptionNpf":\[({"type":"text","text":"([^"]*)"},?)*\],/g, '');

      if (str === null) return;

      filterString = '';
      for (const key in filters) {
        filterString += matchesToString([...str.matchAll(filters[key])]) + ' ';
      }

      filterString = filterString.toLowerCase().replace(/"/g, ' ').replace(/\s{2,}/g, ' ');
      note.__reblogFinderFilter = filterString;
    }

    console.log(filterString, filterString.includes(query));
    if (filterString.includes(query)) {
      console.log(note);
      note.removeAttribute(hiddenAttribute);
    }
    else note.setAttribute(hiddenAttribute, '');
  });
};
const onInput = ({ target }) => {
  const postId = target.closest('[data-id]').getAttribute('data-id');
  const noteSelector = `[data-id='${postId}'] [aria-label='${translate('Post Activity')}'] ${s('root')} > ${s('content')} ${s('root')}`;
  mutationManager.stop(reblogQueryFilter);
  if ($(`[${hiddenAttribute}]`).length) reblogQueryFilter(document.querySelectorAll(`[${hiddenAttribute}]`));
  if (target.value) mutationManager.start(noteSelector, reblogQueryFilter);
};
const search = elem('div', { id: searchId }, null, [
  elem('div', { class: 'dbplus-reblogFinder-icon' }, null, [svgIcon('search', 18, 18)]),
  elem('input', { type: 'text', id: inputId, placeholder: 'Search in notes', value: '' }, { 'input': debounce(onInput) }, null)
]);
const toggleSearch = event => {
  const target = event.target;
  const state = target.getAttribute('active') === 'true' ? true : false;
  const postActivity = target.closest(`[aria-label='${translate('Post Activity')}']`);
  if (!postActivity.querySelector(`#${searchId}`)) {
    $(`#${searchId}`).remove();
    postActivity.querySelector(s('header')).after(search);
  }
  $(search).toggle(!state);
  if (state) {
    target.setAttribute('active', 'false');
  } else {
    target.setAttribute('active', 'true');
  }
  $(`[${hiddenAttribute}]`).removeAttr(hiddenAttribute);
};
const rootButton = () => elem('button', { class: 'dbplus-reblogFinder-tab', title: 'Note Finder', role: 'tab', active: false }, { click: toggleSearch }, [svgIcon('search', 18, 18)]);
const addRootButton = elements => elements.forEach(element => element.after(rootButton()));

export const main = async () => mutationManager.start(targetSelector, addRootButton);

export const clean = async () => {
  mutationManager.stop(addRootButton);
  $(`#${searchId}`).remove();
  $(`[${hiddenAttribute}]`).removeAttr(hiddenAttribute);
  mutationManager.stop(reblogQueryFilter);
};