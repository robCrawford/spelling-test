import { component, html, mount, VNode } from "cr-26";
import wordGrid from "./components/wordGrid";

const { div, h1 } = html;

export type Props = Readonly<{
  word: string;
}>;

export type State = Readonly<{
  slots: (string | null)[];
  dragging: string | null;
}>;

export type ActionPayloads = Readonly<{
  DragStart: { letter: string };
  DropLetter: { slotIndex: number };
  DragEnd: null;
}>;

export type Component = {
  Props: Props;
  State: State;
  ActionPayloads: ActionPayloads;
};

const app = component<Component>(() => ({
  state: (props): State => ({
    slots: props.word.split("").map(() => null),
    dragging: null
  }),

  actions: {
    DragStart: ({ letter }, { state }): { state: State } => ({
      state: { ...state, dragging: letter }
    }),

    DropLetter: ({ slotIndex }, { state }): { state: State } => {
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

    DragEnd: (_, { state }): { state: State } => ({
      state: state.dragging !== null ? { ...state, dragging: null } : state
    })
  },

  view(id, { props, state }): VNode {
    return div(`#${id}.game`, [
      h1(".game-title", "Spell It!"),
      wordGrid(`${id}-word`, { word: props.word, slots: state.slots })
    ]);
  }
}));

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragover", (e) => e.preventDefault());
  mount({ app, props: { word: "Monday" } });
});

export default app;
