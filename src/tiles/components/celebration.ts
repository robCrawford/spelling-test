import { ActionThunk, component, html, VNode } from "cr-26";
import { RootState } from "../app";

const { div, h2, img } = html;

const characterUrls = [
  new URL("../svg/hello-kitty.svg", import.meta.url).href,
  new URL("../svg/kuromi.svg", import.meta.url).href
];

export type Props = Readonly<{
  visible: boolean;
  onTap: ActionThunk;
}>;

type Component = {
  Props: Props;
  RootState: RootState;
};

const COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#ff922b",
  "#cc5de8",
  "#f06595",
  "#74c0fc"
];
const DISTANCES = [100, 140, 110, 160];
const SIZES = [10, 14, 8];
const PARTICLE_COUNT = 24;

function makeParticles(): VNode[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (360 / PARTICLE_COUNT) * i;
    const distance = DISTANCES[i % DISTANCES.length];
    const color = COLORS[i % COLORS.length];
    const delay = (i * 0.04).toFixed(2);
    const size = SIZES[i % SIZES.length];
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(Math.sin(rad) * distance);
    const y = Math.round(-Math.cos(rad) * distance);
    return div(".confetti-particle", {
      key: i,
      attrs: {
        style: `--x: ${x}px; --y: ${y}px; background: ${color}; animation-delay: ${delay}s; width: ${size}px; height: ${size}px`
      }
    });
  });
}

const celebration = component<Component>(() => ({
  view(id, { props, rootState }): VNode {
    if (!props.visible) return div(`#${id}`);
    return div(`#${id}.celebration`, { on: { click: props.onTap } }, [
      div(".celebration-backdrop"),
      div(".celebration-card", [
        div(".confetti-burst", makeParticles()),
        img(".celebration-img", {
          attrs: {
            src: characterUrls[Number(rootState.characterIndex) % characterUrls.length],
            alt: ""
          }
        }),
        div(".celebration-content", [
          h2(".celebration-message", "Well done! 🎉"),
          div(".celebration-stars", "⭐ ⭐ ⭐")
        ])
      ])
    ]);
  }
}));

export default celebration;
