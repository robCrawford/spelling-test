import { initSpelling } from './spelling/index.js';
import { createWordBackground } from './word-background.js';

window.scrollTo(0, 0);

window.$ = selector => document.querySelector(selector);

createWordBackground();
initSpelling();
