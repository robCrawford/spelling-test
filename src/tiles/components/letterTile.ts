import { ActionThunk, component, html, VNode } from "cr-26";

const { div, span } = html;

export type Props = Readonly<{
  letter: string;
  onDragStart: ActionThunk;
  onDragEnd: ActionThunk;
}>;

type Component = {
  Props: Props;
};

const letterTile = component<Component>(() => ({
  view(id, { props }): VNode {
    return div(
      `#${id}.tile`,
      {
        attrs: { draggable: "true" },
        on: { dragstart: props.onDragStart, dragend: props.onDragEnd }
      },
      span(".tile-letter", props.letter.toUpperCase())
    );
  }
}));

export default letterTile;
