import { ActionThunk, component, html, Next, Task, VNode } from "cr-26";
import letterTile from "./letterTile";
import letterSlot from "./letterSlot";
import { shuffleNotInOrder } from "../utils/words";
import { speak } from "../../utils";

const { div } = html;

export type Props = Readonly<{
  word: string;
  onComplete: ActionThunk;
}>;

type State = Readonly<{
  shuffledLetters: string[];
  letterSlots: (string | null)[];
  draggedLetter: string | null;
}>;

type Component = {
  Props: Props;
  State: State;
  ActionPayloads: Readonly<{
    DragLetterStart: { letter: string };
    DragFromSlot: { slotIndex: number; letter: string };
    ClearSlot: { slotIndex: number };
    DropLetter: { slotIndex: number };
    DragLetterEnd: undefined;
    TouchStart: { letter: string; tileIndex: number };
    TouchMove: undefined;
    TouchEnd: undefined;
  }>;
  TaskPayloads: Readonly<{
    SpeakString: { word: string };
    AttachDragClone: { tileId: string; clientX: number; clientY: number };
    MoveDragClone: { clientX: number; clientY: number };
    FinalizeDrop: { clientX: number; clientY: number };
  }>;
};

const wordGrid = component<Component>(({ action, task }) => {
  let dragClone: HTMLElement | null = null;

  const moveDragClone = (clientX: number, clientY: number): void => {
    if (!dragClone) return;
    const halfW = dragClone.offsetWidth / 2;
    const halfH = dragClone.offsetHeight / 2;
    dragClone.style.left = `${clientX - halfW}px`;
    dragClone.style.top = `${clientY - halfH}px`;
  };

  return {
    state: (props): State => ({
      shuffledLetters: shuffleNotInOrder(props.word.split("")),
      letterSlots: props.word.split("").map(() => null),
      draggedLetter: null
    }),

    actions: {
      DragLetterStart: ({ letter }, { state }): { state: State } => ({
        state: { ...state, draggedLetter: letter }
      }),

      DragFromSlot: ({ slotIndex, letter }, { state }): { state: State } => ({
        state: {
          ...state,
          draggedLetter: letter,
          letterSlots: state.letterSlots.map((s, i) => (i === slotIndex ? null : s))
        }
      }),

      ClearSlot: ({ slotIndex }, { state }): { state: State } => ({
        state: {
          ...state,
          letterSlots: state.letterSlots.map((s, i) => (i === slotIndex ? null : s))
        }
      }),

      DropLetter: ({ slotIndex }, { state, props }): { state: State; next?: Next } => {
        const { draggedLetter } = state;
        if (draggedLetter === null) return { state };
        const newLetterSlots = state.letterSlots.map((s, i) =>
          i === slotIndex ? draggedLetter : s
        );
        const letters = props.word.split("");
        const isComplete = newLetterSlots.every(
          (slot, i) => slot !== null && slot.toLowerCase() === letters[i].toLowerCase()
        );
        return {
          state: { ...state, draggedLetter: null, letterSlots: newLetterSlots },
          next: isComplete
            ? [task("SpeakString", { word: `${props.word}.` }), props.onComplete]
            : task("SpeakString", { word: draggedLetter.toLowerCase() })
        };
      },

      DragLetterEnd: (_, { state }): { state: State; next?: Next } => {
        if (state.draggedLetter === null) return { state };
        return {
          state: { ...state, draggedLetter: null },
          next: task("SpeakString", { word: state.draggedLetter })
        };
      },

      TouchStart: ({ letter, tileIndex }, { id, state, event }): { state: State; next: Next } => ({
        state,
        next: [
          action("DragLetterStart", { letter }),
          task("AttachDragClone", {
            tileId: `${id}-tile-${tileIndex}`,
            clientX: event?.touches?.[0]?.clientX ?? 0,
            clientY: event?.touches?.[0]?.clientY ?? 0
          })
        ]
      }),

      TouchMove: (_, { state, event }): { state: State; next: Next } => ({
        state,
        next: task("MoveDragClone", {
          clientX: event?.touches?.[0]?.clientX ?? 0,
          clientY: event?.touches?.[0]?.clientY ?? 0
        })
      }),

      TouchEnd: (_, { state, event }): { state: State; next: Next } => ({
        state,
        next: task("FinalizeDrop", {
          clientX: event?.changedTouches?.[0]?.clientX ?? 0,
          clientY: event?.changedTouches?.[0]?.clientY ?? 0
        })
      })
    },

    tasks: {
      SpeakString: ({ word }): Task<void, Props, State> => ({
        perform: (): void => {
          speak(word);
        }
      }),

      AttachDragClone: ({ tileId, clientX, clientY }): Task<void, Props, State> => ({
        perform: (): void => {
          const target = document.getElementById(tileId);
          const rect = target?.getBoundingClientRect?.();
          const cloned = target?.cloneNode?.(true) ?? null;
          dragClone = cloned instanceof HTMLElement ? cloned : null;
          if (dragClone && rect) {
            Object.assign(dragClone.style, {
              position: "fixed",
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              pointerEvents: "none",
              opacity: "0.85",
              zIndex: "1000",
              margin: "0"
            });
            document.body.appendChild(dragClone);
            moveDragClone(clientX, clientY);
          }
        }
      }),

      MoveDragClone: ({ clientX, clientY }): Task<void, Props, State> => ({
        perform: (): void => {
          moveDragClone(clientX, clientY);
        }
      }),

      FinalizeDrop: ({ clientX, clientY }): Task<number | null, Props, State> => ({
        perform: (): number | null => {
          if (dragClone) {
            dragClone.remove();
            dragClone = null;
          }
          const elements = document.elementsFromPoint(clientX, clientY);
          const slotEl = elements.find((el) => el.classList.contains("tile-slot"));
          if (slotEl) {
            const match = slotEl.id.match(/-slot-(\d+)$/);
            if (match) return Number(match[1]);
          }
          return null;
        },
        success: (slotIndex): Next =>
          slotIndex !== null ? action("DropLetter", { slotIndex }) : action("DragLetterEnd")
      })
    },

    view({ id, state, props }): VNode {
      const letters = props.word.split("");
      const shuffled = state.shuffledLetters;
      const complete = state.letterSlots.every(
        (slot, i) => slot !== null && slot.toLowerCase() === letters[i].toLowerCase()
      );

      const correctCounts = state.letterSlots.reduce<Record<string, number>>((acc, slot, i) => {
        if (slot !== null && slot.toLowerCase() === letters[i].toLowerCase()) {
          const key = slot.toLowerCase();
          return { ...acc, [key]: (acc[key] || 0) + 1 };
        }
        return acc;
      }, {});

      const usedCounts: Record<string, number> = {};
      const disabledTiles = shuffled.map((letter) => {
        const key = letter.toLowerCase();
        const used = usedCounts[key] || 0;
        if (used < (correctCounts[key] || 0)) {
          usedCounts[key] = used + 1;
          return true;
        }
        return false;
      });

      return div(`#${id}.word-grid${complete ? ".word-complete" : ""}`, [
        div(
          ".letterSlots-row",
          letters.map((letter, i) => {
            const dropped = state.letterSlots[i] ?? null;
            const isCorrect =
              dropped !== null ? dropped.toLowerCase() === letter.toLowerCase() : null;
            const isDraggable = !!dropped && !complete;
            return letterSlot(`${id}-slot-${i}`, {
              droppedLetter: dropped,
              isCorrect,
              draggable: isDraggable,
              onDrop: action("DropLetter", { slotIndex: i }),
              onDragFromSlot: action("DragFromSlot", { slotIndex: i, letter: dropped ?? "" }),
              onDragEnd: action("DragLetterEnd"),
              onReset: action("ClearSlot", { slotIndex: i })
            });
          })
        ),
        div(
          ".tiles-pool",
          shuffled.map((letter, i) =>
            letterTile(`${id}-tile-${i}`, {
              letter,
              disabled: disabledTiles[i],
              onDragLetterStart: action("DragLetterStart", { letter }),
              onDragLetterEnd: action("DragLetterEnd"),
              onTouchStart: action("TouchStart", { letter, tileIndex: i }),
              onTouchMove: action("TouchMove"),
              onTouchEnd: action("TouchEnd")
            })
          )
        )
      ]);
    }
  };
});

export default wordGrid;
