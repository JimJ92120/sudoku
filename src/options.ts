import { Vec4 } from "./type";

const SCENE_WIDTH = 510;
const SCENE_HEIGHT = SCENE_WIDTH;

const ZONE_SIZE = SCENE_WIDTH / 3;
const CELL_SIZE = ZONE_SIZE / 3;

const COLORS: { [key: string]: Vec4 } = {
  PRIMARY: [240, 240, 240, 1], // light grey
  SECONDARY: [170, 170, 170, 1], // grey
  LINES: [0, 0, 0, 1], // black
  TEXT: [0, 0, 0, 1],
  BACKGROUND: [0, 0, 0, 1],
  HIGHLIGHT: [255, 0, 0, 1], // red
  VALID: [0, 255, 0, 1], // green
};

export { SCENE_WIDTH, SCENE_HEIGHT, ZONE_SIZE, CELL_SIZE, COLORS };
