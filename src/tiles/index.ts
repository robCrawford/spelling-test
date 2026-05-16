import { mount } from "cr-26";
import app from "./app";
import { getGameWord } from "./services/data";
import { preloadImages } from "./services/browser";
import { characterUrls } from "./components/celebration";

document.addEventListener("DOMContentLoaded", () => {
  preloadImages(characterUrls);
  document.addEventListener("dragover", (e) => e.preventDefault());
  mount({ app, props: { word: getGameWord() } });
});
