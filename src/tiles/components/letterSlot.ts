import { ActionThunk, component, html, VNode } from "cr-26";

const { div, span } = html;

export type Props = Readonly<{
  droppedLetter: string | null;
  isCorrect: boolean | null;
  onDrop: ActionThunk;
}>;

type Component = {
  Props: Props;
};

const letterSlot = component<Component>(() => ({
  view(id, { props }): VNode {
    const { droppedLetter, isCorrect, onDrop } = props;
    const statusClass = isCorrect === null ? "" : isCorrect ? ".correct" : ".incorrect";
    const children = droppedLetter ? [span(".tile-letter", droppedLetter.toUpperCase())] : [];
    return div(`#${id}.tile-slot${statusClass}`, { on: { drop: onDrop } }, children);
  }
}));

export default letterSlot;
