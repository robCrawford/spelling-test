import { component, html, mount, Next, Task, VNode } from "cr-26";
import wordGrid from "./components/wordGrid";
import celebration from "./components/celebration";
import {
  addReward,
  getLocalStorage,
  getRewardsDisplayAmount,
  localStorageKeys,
  redeemAllRewards,
  reloadPage,
  setLocalStorage
} from "./services/browser";
import { speak } from "../utils";
import { getGameWord } from "./services/data";

const { div } = html;

export type RootProps = Readonly<{
  word: string;
}>;

export type RootState = Readonly<{
  celebrationImgIndex: string;
  celebrationVisible: boolean;
  letterSlots: (string | null)[];
  draggedLetter: string | null;
  rewardsDisplayAmount: number;
}>;

export type RootActionPayloads = Readonly<{
  DragLetterStart: { letter: string };
  DropLetter: { slotIndex: number };
  DragLetterEnd: null;
  ShowCelebration: null;
  Reload: null;
  RedeemRewards: null;
}>;

export type RootTaskPayloads = Readonly<{
  SpeakString: { word: string };
  RepeatWordTask: { word: string; hintId: string };
  CelebrateTask: null;
  ReloadPage: { newcelebrationImgIndex: string };
  RedeemRewardsTask: null;
}>;

export type Component = {
  Props: RootProps;
  State: RootState;
  ActionPayloads: RootActionPayloads;
  TaskPayloads: RootTaskPayloads;
};

const app = component<Component>(({ action, task }) => ({
  state: (props): RootState => ({
    celebrationImgIndex: getLocalStorage(localStorageKeys.celebrationImgIndex) || "0",
    celebrationVisible: false,
    letterSlots: props.word.split("").map(() => null),
    draggedLetter: null,
    rewardsDisplayAmount: getRewardsDisplayAmount()
  }),

  actions: {
    DragLetterStart: ({ letter }, { state }): { state: RootState } => ({
      state: { ...state, draggedLetter: letter }
    }),

    DropLetter: ({ slotIndex }, { state, props }): { state: RootState; next?: Next } => {
      const { draggedLetter } = state;
      if (draggedLetter === null) return { state };
      const newLetterSlots = state.letterSlots.map((s, i) => (i === slotIndex ? draggedLetter : s));
      const isComplete = newLetterSlots.every(
        (slot, i) => slot !== null && slot.toLowerCase() === props.word[i].toLowerCase()
      );
      return {
        state: { ...state, draggedLetter: null, letterSlots: newLetterSlots },
        next: isComplete ? task("CelebrateTask") : task("SpeakString", { word: draggedLetter })
      };
    },

    DragLetterEnd: (_, { state }): { state: RootState; next?: Next } => ({
      state: state.draggedLetter !== null ? { ...state, draggedLetter: null } : state,
      ...(state.draggedLetter !== null && {
        next: task("SpeakString", { word: state.draggedLetter })
      })
    }),

    ShowCelebration: (_, { state }): { state: RootState } => ({
      state: { ...state, celebrationVisible: true }
    }),

    Reload: (_, { state }): { state: RootState; next: Next } => ({
      state,
      next: task("ReloadPage", {
        newcelebrationImgIndex: String(Number(state.celebrationImgIndex) + 1)
      })
    }),

    RedeemRewards: (_, { state }): { state: RootState; next: Next } => ({
      state,
      next: task("RedeemRewardsTask")
    })
  },

  tasks: {
    SpeakString: ({ word }): Task<void, RootProps, RootState> => ({
      perform: (): void => {
        speak(word);
      }
    }),

    CelebrateTask: (): Task<void, RootProps, RootState> => ({
      perform: (): Promise<void> => {
        const name = window.localStorage.getItem("spelling-name") || "";
        speak(`Awesome job ${name}! You are rocking it! Go go go`);
        return new Promise((resolve) => setTimeout(resolve, 800));
      },
      success: (): Next => action("ShowCelebration")
    }),

    RepeatWordTask: ({ word, hintId }): Task<void, RootProps, RootState> => ({
      perform: (): void => {
        speak(word);
        const hintEl = document.getElementById(hintId);
        if (hintEl) {
          hintEl.style.visibility = "visible";
          setTimeout(() => {
            hintEl.style.visibility = "hidden";
          }, 500);
        }
      }
    }),
    ReloadPage: ({ newcelebrationImgIndex }): Task<void, RootProps, RootState> => ({
      perform: (): void => {
        addReward(10);
        setLocalStorage(localStorageKeys.celebrationImgIndex, newcelebrationImgIndex);
        reloadPage();
      }
    }),

    RedeemRewardsTask: (): Task<void, RootProps, RootState> => ({
      perform: (): void => {
        if (window.confirm("Redeem all points?")) {
          redeemAllRewards();
          reloadPage();
        }
      }
    })
  },

  view(id, { props, state }): VNode {
    return div(`#${id}.game`, [
      div(".game-title", "Spell It!"),
      div(".word-hint-row", [
        div(".word-hint", [div(`#${id}-word-hint-text.word-hint-text`, props.word)]),
        div(
          ".game-title-repeat",
          {
            on: {
              click: task("RepeatWordTask", { word: props.word, hintId: `${id}-word-hint-text` })
            }
          },
          "↻"
        )
      ]),
      wordGrid(`${id}-word`, { word: props.word, letterSlots: state.letterSlots }),
      celebration(`${id}-celebration`, {
        visible: state.celebrationVisible,
        onTap: action("Reload")
      }),
      div(
        ".tiles-rewards",
        { on: { click: action("RedeemRewards") } },
        `🌟 ${state.rewardsDisplayAmount}`
      )
    ]);
  }
}));

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragover", (e) => e.preventDefault());
  mount({ app, props: { word: getGameWord() } });
});

export default app;
