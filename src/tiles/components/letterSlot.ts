import { ActionThunk, component, html, VNode } from "cr-26";

const { div, span } = html;

export type Props = Readonly<{
  droppedLetter: string | null;
  isCorrect: boolean | null;
  draggable: boolean;
  onDrop: ActionThunk;
  onDragFromSlot: ActionThunk;
  onDragEnd: ActionThunk;
  onReset: ActionThunk;
}>;

type Component = {
  Props: Props;
};

const letterSlot = component<Component>(() => ({
  view(id, { props }): VNode {
    const { droppedLetter, isCorrect, draggable, onDrop, onDragFromSlot, onDragEnd, onReset } =
      props;
    const statusClass = isCorrect === null ? "" : isCorrect ? ".correct" : ".incorrect";
    const draggableClass = draggable ? ".draggable" : "";
    const children = droppedLetter ? [span(".tile-letter", droppedLetter.toUpperCase())] : [];
    return div(
      `#${id}.tile-slot${statusClass}${draggableClass}`,
      {
        attrs: { draggable: draggable ? "true" : "false" },
        on: {
          drop: onDrop,
          ...(draggable && { dragstart: onDragFromSlot, dragend: onDragEnd }),
          ...(isCorrect === false && { touchstart: onReset })
        }
      },
      children
    );
  }
}));

export default letterSlot;
