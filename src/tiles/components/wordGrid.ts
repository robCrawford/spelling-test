import { component, html, VNode } from "cr-26";
import type { RootActionPayloads } from "../app";
import letterTile from "./letterTile";
import letterSlot from "./letterSlot";

const { div } = html;

export type Props = Readonly<{
  word: string;
  slots: (string | null)[];
}>;

type Component = {
  Props: Props;
  RootActionPayloads: RootActionPayloads;
};

const wordGrid = component<Component>(({ rootAction }) => ({
  view(id, { props }): VNode {
    const letters = props.word.split("");
    const shuffled = [...letters].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return div(`#${id}.word-grid`, [
      div(
        ".slots-row",
        letters.map((letter, i) => {
          const dropped = props.slots[i] ?? null;
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
            onDragStart: rootAction("DragStart", { letter }),
            onDragEnd: rootAction("DragEnd")
          })
        )
      )
    ]);
  }
}));

export default wordGrid;
