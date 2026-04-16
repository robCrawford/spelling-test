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
  letterSlots: (string | null)[];
  draggedLetter: string | null;
  rewardsDisplayAmount: number;
}>;

export type RootActionPayloads = Readonly<{
  DragLetterStart: { letter: string };
  DropLetter: { slotIndex: number };
  DragLetterEnd: null;
  Reload: null;
  RedeemRewards: null;
}>;

export type RootTaskPayloads = Readonly<{
  SpeakString: { word: string };
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
    letterSlots: props.word.split("").map(() => null),
    draggedLetter: null,
    rewardsDisplayAmount: getRewardsDisplayAmount()
  }),

  actions: {
    DragLetterStart: ({ letter }, { state }): { state: RootState } => ({
      state: { ...state, draggedLetter: letter }
    }),

    DropLetter: ({ slotIndex }, { state }): { state: RootState; next?: Next } => {
      const { draggedLetter } = state;
      if (draggedLetter === null) return { state };
      return {
        state: {
          ...state,
          draggedLetter: null,
          letterSlots: state.letterSlots.map((s, i) => (i === slotIndex ? draggedLetter : s))
        },
        next: task("SpeakString", { word: draggedLetter })
      };
    },

    DragLetterEnd: (_, { state }): { state: RootState; next?: Next } => ({
      state: state.draggedLetter !== null ? { ...state, draggedLetter: null } : state,
      ...(state.draggedLetter !== null && {
        next: task("SpeakString", { word: state.draggedLetter })
      })
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
    const isComplete = state.letterSlots.every(
      (slot, i) => slot !== null && slot.toLowerCase() === props.word[i].toLowerCase()
    );
    return div(`#${id}.game`, [
      div(
        ".game-title",
        {
          on: {
            click: task("SpeakString", { word: props.word })
          }
        },
        "Spell It!"
      ),
      wordGrid(`${id}-word`, { word: props.word, letterSlots: state.letterSlots }),
      celebration(`${id}-celebration`, { visible: isComplete, onTap: action("Reload") }),
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
