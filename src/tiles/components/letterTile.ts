import { ActionThunk, component, html, VNode } from "cr-26";

const { div, span } = html;

type EventHandler = (e: Event) => void;

export type Props = Readonly<{
  letter: string;
  disabled: boolean;
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
    const { letter, disabled } = props;
    return div(
      `#${id}.tile${disabled ? ".disabled" : ""}`,
      {
        attrs: { draggable: disabled ? "false" : "true" },
        on: disabled
          ? {}
          : {
              dragstart: props.onDragLetterStart,
              dragend: props.onDragLetterEnd,
              touchstart: props.onTouchStart,
              touchmove: props.onTouchMove,
              touchend: props.onTouchEnd
            }
      },
      span(".tile-letter", letter.toUpperCase())
    );
  }
}));

export default letterTile;
