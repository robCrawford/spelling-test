import { component, html, VNode } from "cr-26";
import type { RootActionPayloads } from "../app";
import letterTile from "./letterTile";
import letterSlot from "./letterSlot";

const { div } = html;

export type Props = Readonly<{
  word: string;
  letterSlots: (string | null)[];
}>;

type Component = {
  Props: Props;
  RootActionPayloads: RootActionPayloads;
};

type TargetInputProps = EventTarget & Partial<HTMLInputElement> & Partial<Node>;

export type NormalizedEvent = Event & {
  target: TargetInputProps | null;
  currentTarget: TargetInputProps | null;
} & Partial<TouchEvent>;

const wordGrid = component<Component>(({ rootAction }) => {
  let dragClone: HTMLElement | null = null;

  const onTouchStart =
    (letter: string) =>
    (e: NormalizedEvent): void => {
      const touch = e.touches?.[0];
      const target = e.currentTarget;
      const rect = target?.getBoundingClientRect?.();
      const cloned = target?.cloneNode?.(true) ?? null;
      dragClone = cloned instanceof HTMLElement ? cloned : null;

      if (touch && dragClone && rect) {
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
        rootAction("DragLetterStart", { letter })(e);
        // Suppress initial touch coords so moveTouchDrag centres immediately
        moveTouchDrag(touch.clientX, touch.clientY);
      }
    };

  const moveTouchDrag = (clientX: number, clientY: number): void => {
    if (!dragClone) return;
    const halfW = dragClone.offsetWidth / 2;
    const halfH = dragClone.offsetHeight / 2;
    dragClone.style.left = `${clientX - halfW}px`;
    dragClone.style.top = `${clientY - halfH}px`;
  };

  const onTouchMove = (e: NormalizedEvent): void => {
    const touch = e.touches?.[0];
    if (touch) {
      moveTouchDrag(touch.clientX, touch.clientY);
    }
  };

  const onTouchEnd = (e: NormalizedEvent): void => {
    if (dragClone) {
      dragClone.remove();
      dragClone = null;
    }
    const touch = e.changedTouches?.[0];
    if (touch) {
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const slotEl = elements.find((el) => el.classList.contains("tile-slot"));
      if (slotEl) {
        const match = slotEl.id.match(/-slot-(\d+)$/);
        if (match) {
          rootAction("DropLetter", { slotIndex: Number(match[1]) })(e);
          return;
        }
      }
      rootAction("DragLetterEnd")(e);
    }
  };

  return {
    view(id, { props }): VNode {
      const letters = props.word.split("");
      const shuffled = [...letters].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      return div(`#${id}.word-grid`, [
        div(
          ".letterSlots-row",
          letters.map((letter, i) => {
            const dropped = props.letterSlots[i] ?? null;
            const isCorrect =
              dropped !== null ? dropped.toLowerCase() === letter.toLowerCase() : null;
            return letterSlot(`${id}-slot-${i}`, {
              droppedLetter: dropped,
              isCorrect,
              onDrop: rootAction("DropLetter", { slotIndex: i })
            });
          })
        ),
        div(
          ".tiles-pool",
          shuffled.map((letter, i) =>
            letterTile(`${id}-tile-${i}`, {
              letter,
              onDragLetterStart: rootAction("DragLetterStart", { letter }),
              onDragLetterEnd: rootAction("DragLetterEnd"),
              onTouchStart: onTouchStart(letter),
              onTouchMove,
              onTouchEnd
            })
          )
        )
      ]);
    }
  };
});

export default wordGrid;
