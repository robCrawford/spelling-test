import { ActionThunk, component, html, VNode } from "cr-26";

const { div, span } = html;

type EventHandler = (e: Event) => void;

export type Props = Readonly<{
  letter: string;
  onDragLetterStart: ActionThunk;
  onDragLetterEnd: ActionThunk;
  onTouchStart: EventHandler;
  onTouchMove: EventHandler;
  onTouchEnd: EventHandler;
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
        on: {
          dragstart: props.onDragLetterStart,
          dragend: props.onDragLetterEnd,
          touchstart: props.onTouchStart,
          touchmove: props.onTouchMove,
          touchend: props.onTouchEnd
        }
      },
      span(".tile-letter", props.letter.toUpperCase())
    );
  }
}));

export default letterTile;
