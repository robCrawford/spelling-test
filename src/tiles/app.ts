import { component, html, mount, Next, Task, VNode } from "cr-26";
import wordGrid from "./components/wordGrid";
import celebration from "./components/celebration";
import { reloadPage } from "./services/browser";

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
  Reload: null;
}>;

export type TaskPayloads = Readonly<{
  ReloadPage: null;
}>;

export type Component = {
  Props: Props;
  State: State;
  ActionPayloads: ActionPayloads;
  TaskPayloads: TaskPayloads;
};

const app = component<Component>(({ action, task }) => ({
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
    }),

    Reload: (_, { state }): { state: State; next: Next } => ({
      state,
      next: task("ReloadPage")
    })
  },

  tasks: {
    ReloadPage: (): Task<void, Props, State> => ({
      perform: reloadPage
    })
  },

  view(id, { props, state }): VNode {
    const isComplete = state.slots.every(
      (slot, i) => slot !== null && slot.toLowerCase() === props.word[i].toLowerCase()
    );
    return div(`#${id}.game`, [
      h1(".game-title", "Spell It!"),
      wordGrid(`${id}-word`, { word: props.word, slots: state.slots }),
      celebration(`${id}-celebration`, { visible: isComplete, onTap: action("Reload") })
    ]);
  }
}));

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragover", (e) => e.preventDefault());
  mount({ app, props: { word: "Monday" } });
});

export default app;
