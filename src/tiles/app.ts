import { component, html, Next, Task, VNode } from "cr-26";
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

import { config } from "./config";

const { div } = html;

export type RootProps = Readonly<{
  word: string;
}>;

export type RootState = Readonly<{
  celebrationImgIndex: string;
  celebrationVisible: boolean;
  rewardsDisplayAmount: number;
}>;

export type RootActionPayloads = Readonly<{
  WordComplete: undefined;
  ShowCelebration: undefined;
  Reload: undefined;
  RedeemRewards: undefined;
}>;

export type RootTaskPayloads = Readonly<{
  RepeatWordTask: { word: string; hintId: string };
  CelebrateTask: undefined;
  AutoReloadTask: undefined;
  ReloadPage: { newcelebrationImgIndex: string };
  RedeemRewardsTask: undefined;
}>;

export type Component = {
  Props: RootProps;
  State: RootState;
  ActionPayloads: RootActionPayloads;
  TaskPayloads: RootTaskPayloads;
};

const app = component<Component>(({ action, task }) => ({
  state: (): RootState => ({
    celebrationImgIndex: getLocalStorage(localStorageKeys.celebrationImgIndex) || "0",
    celebrationVisible: false,
    rewardsDisplayAmount: getRewardsDisplayAmount()
  }),

  actions: {
    WordComplete: (_, { state }): { state: RootState; next: Next } => ({
      state,
      next: task("CelebrateTask")
    }),

    ShowCelebration: (_, { state }): { state: RootState; next: Next } => ({
      state: { ...state, celebrationVisible: true },
      next: task("AutoReloadTask")
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
    CelebrateTask: (): Task<void, RootProps, RootState> => ({
      perform: (): Promise<void> => {
        const name = window.localStorage.getItem("spelling-name") || "";
        speak(`Good job ${name}! Go go go`);
        return new Promise((resolve) => setTimeout(resolve, 1000));
      },
      success: (): Next => action("ShowCelebration")
    }),

    AutoReloadTask: (): Task<void, RootProps, RootState> => ({
      perform: (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 3000)),
      success: (): Next => action("Reload")
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
        addReward(config.rewardPerWord);
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

  view({ id, props, state }): VNode {
    return div(`#${id}.game`, [
      div(".game-title", "Spell It!"),
      div(".word-hint-row", [
        div(
          ".word-hint",
          {
            on: {
              click: task("RepeatWordTask", { word: props.word, hintId: `${id}-word-hint-text` })
            }
          },
          [div(`#${id}-word-hint-text.word-hint-text`, props.word)]
        ),
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
      wordGrid(`${id}-word`, {
        word: props.word,
        onComplete: action("WordComplete")
      }),
      celebration(`${id}-celebration`, {
        visible: state.celebrationVisible,
        imgIndex: state.celebrationImgIndex,
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

export default app;
