import { component, html, mount, Next, Task, VNode } from "cr-26";
import wordGrid from "./components/wordGrid";
import celebration from "./components/celebration";
import { getLocalStorage, localStorageKeys, reloadPage, setLocalStorage } from "./services/browser";
import { speak } from "../utils";
import { getGameWord } from "./services/data";

const { div } = html;

export type RootProps = Readonly<{
  word: string;
}>;

export type RootState = Readonly<{
  characterIndex: string;
  slots: (string | null)[];
  dragging: string | null;
}>;

export type RootActionPayloads = Readonly<{
  DragStart: { letter: string };
  DropLetter: { slotIndex: number };
  DragEnd: { letter: string };
  Reload: null;
}>;

export type RootTaskPayloads = Readonly<{
  SpeakWord: { word: string };
  ReloadPage: { newCharacterIndex: string };
}>;

export type Component = {
  Props: RootProps;
  State: RootState;
  ActionPayloads: RootActionPayloads;
  TaskPayloads: RootTaskPayloads;
};

const app = component<Component>(({ action, task }) => ({
  state: (props): RootState => ({
    characterIndex: getLocalStorage(localStorageKeys.characterIndex) || "0",
    slots: props.word.split("").map(() => null),
    dragging: null
  }),

  actions: {
    DragStart: ({ letter }, { state }): { state: RootState } => ({
      state: { ...state, dragging: letter }
    }),

    DropLetter: ({ slotIndex }, { state }): { state: RootState } => {
      const { dragging } = state;
      if (dragging === null) return { state };
      return {
        state: {
          ...state,
          dragging: null,
          slots: state.slots.map((s, i) => (i === slotIndex ? dragging : s))
        }
      };
    },

    DragEnd: ({ letter }, { state }): { state: RootState; next: Next } => ({
      state: state.dragging !== null ? { ...state, dragging: null } : state,
      next: task("SpeakWord", { word: letter })
    }),

    Reload: (_, { state }): { state: RootState; next: Next } => ({
      state,
      next: task("ReloadPage", {
        newCharacterIndex: String(Number(state.characterIndex) + 1)
      })
    })
  },

  tasks: {
    SpeakWord: ({ word }): Task<void, RootProps, RootState> => ({
      perform: (): void => {
        speak(word);
      }
    }),
    ReloadPage: ({ newCharacterIndex }): Task<void, RootProps, RootState> => ({
      perform: (): void => {
        setLocalStorage(localStorageKeys.characterIndex, newCharacterIndex);
        reloadPage();
      }
    })
  },

  view(id, { props, state }): VNode {
    const isComplete = state.slots.every(
      (slot, i) => slot !== null && slot.toLowerCase() === props.word[i].toLowerCase()
    );
    return div(`#${id}.game`, [
      div(
        ".game-title",
        {
          on: {
            click: task("SpeakWord", { word: props.word })
          }
        },
        "Spell It!"
      ),
      wordGrid(`${id}-word`, { word: props.word, slots: state.slots }),
      celebration(`${id}-celebration`, { visible: isComplete, onTap: action("Reload") })
    ]);
  }
}));

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragover", (e) => e.preventDefault());
  mount({ app, props: { word: getGameWord() } });
});

export default app;
