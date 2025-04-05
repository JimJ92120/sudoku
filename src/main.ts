import init, { Sudoku } from "../dist/lib";
import { App } from "./App";

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

const VEC_3: Vec3 = [...Array(3).keys()] as Vec3;

function rgba(values: Vec4): string {
  return `rgba(${values.join(", ")})`;
}

//
function drawSquareLines(
  context: CanvasRenderingContext2D,
  origin: [number, number],
  size: number,
  color: Vec4
): void {
  context.strokeStyle = rgba(color);

  context.beginPath();
  context.moveTo(origin[0], origin[1]);
  context.lineTo(origin[0] + size, origin[1]);
  context.lineTo(origin[0] + size, origin[1] + size);
  context.lineTo(origin[0], origin[1] + size);
  context.lineTo(origin[0], origin[1]);
  context.stroke();
}
function drawZoneCells(
  context: CanvasRenderingContext2D,
  values: number[][],
  origin: Vec2,
  size: number,
  color: Vec4,
  textColor: Vec4
): void {
  VEC_3.map((_, rowIndex) => {
    VEC_3.map((__, columnIndex) => {
      const position: Vec2 = [
        origin[0] + columnIndex * size,
        origin[1] + rowIndex * size,
      ];
      drawSquareLines(context, position, size, color);

      context.fillStyle = rgba(textColor);
      context.font = "24px Arial";
      context.fillText(
        `${values[rowIndex][columnIndex]}`,
        position[0] + size / 2.5,
        position[1] + size / 1.6
      );
    });
  });
}
function drawZoneBackground(
  context: CanvasRenderingContext2D,
  origin: Vec2,
  color: Vec4,
  size: number
): void {
  context.fillStyle = rgba(color);
  context.fillRect(origin[0], origin[1], size, size);
}

//
const WIDTH = 600;
const HEIGHT = WIDTH;
const ZONE_SIZE = WIDTH / 3;
const CELL_SIZE = ZONE_SIZE / 3;
const BACKGROUND_COLOR: Vec4 = [0, 0, 0, 1];
const COLORS: { [key: string]: Vec4 } = {
  PRIMARY: [240, 240, 240, 1], // light grey
  SECONDARY: [170, 170, 170, 1], // grey
  LINES: [0, 0, 0, 1], // black
  TEXT: [0, 0, 0, 1],
};

window.addEventListener("load", () => {
  init().then(() => {
    const app = new App("app", "Sudoku");
    app.render();

    const $canvas: HTMLCanvasElement = app.$container.querySelector("#scene")!;
    const $faceMap: HTMLPreElement = app.$container.querySelector("#map")!;
    const context: CanvasRenderingContext2D = $canvas.getContext("2d")!;
    $canvas.width = WIDTH;
    $canvas.height = HEIGHT;
    $canvas.style.backgroundColor = rgba(BACKGROUND_COLOR);

    //
    const sudoku = new Sudoku();
    console.log(sudoku);

    let loop = 0;
    const animate: FrameRequestCallback = () => {
      if (loop > 0) {
        $faceMap.innerText = "...";

        context.clearRect(0, 0, $canvas.width, $canvas.height);

        VEC_3.map((_, rowIndex) => {
          VEC_3.map((__, columnIndex) => {
            const color =
              (!(rowIndex % 2) && columnIndex % 2) ||
              (rowIndex % 2 && !(columnIndex % 2))
                ? COLORS.SECONDARY
                : COLORS.PRIMARY;
            const position: Vec2 = [
              columnIndex * ZONE_SIZE,
              rowIndex * ZONE_SIZE,
            ];
            const valuePosition: Vec2 = [rowIndex * 3, columnIndex * 3];

            drawZoneBackground(context, position, color, ZONE_SIZE);
            drawZoneCells(
              context,
              VEC_3.map((index) =>
                sudoku.data[valuePosition[0] + index].slice(
                  valuePosition[1],
                  valuePosition[1] + 3
                )
              ),
              position,
              CELL_SIZE,
              COLORS.LINES,
              COLORS.TEXT
            );
            //
          });
        });
      }

      loop = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
});
