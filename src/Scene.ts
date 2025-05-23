import { Vec2, Vec4, VEC_3 } from "./type";

import {
  SCENE_WIDTH,
  SCENE_HEIGHT,
  ZONE_SIZE,
  COLORS,
  CELL_SIZE,
} from "./options";

type SceneInputEvent = {
  position?: Vec2;
  value?: number;
};
class Scene {
  selectedPosition: Vec2 | null = null;
  filledPositions: Vec2[] = [];

  private $canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor($canvas: HTMLCanvasElement) {
    this.$canvas = $canvas;

    this.context = this.$canvas.getContext("2d")!;
    this.$canvas.width = SCENE_WIDTH;
    this.$canvas.height = SCENE_HEIGHT;
    this.$canvas.style.backgroundColor = this.rgba(COLORS.BACKGROUND);
  }

  //
  render(
    data: number[][],
    guessData: number[][][],
    shadowData: number[][]
  ): void {
    this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

    [...Array(9).keys()].map((index) => {
      const rowIndex = Math.floor(index / 3);
      const columnIndex = index % 3;

      let color =
        (!(rowIndex % 2) && columnIndex % 2) ||
        (rowIndex % 2 && !(columnIndex % 2))
          ? COLORS.SECONDARY
          : COLORS.PRIMARY;

      const position: Vec2 = [columnIndex * ZONE_SIZE, rowIndex * ZONE_SIZE];
      const valuePosition: Vec2 = [columnIndex * 3, rowIndex * 3];

      this.drawZoneBackground(position, color);
      this.drawZoneCells(
        VEC_3.map((index) =>
          data[valuePosition[1] + index].slice(
            valuePosition[0],
            valuePosition[0] + 3
          )
        ),
        VEC_3.map((index) =>
          guessData[valuePosition[1] + index].slice(
            valuePosition[0],
            valuePosition[0] + 3
          )
        ),
        VEC_3.map((index) =>
          shadowData[valuePosition[1] + index].slice(
            valuePosition[0],
            valuePosition[0] + 3
          )
        ),
        position,
        CELL_SIZE,
        COLORS.LINES,
        COLORS.TEXT
      );

      [...Array(9).keys()].map((_index) => {
        const _rowIndex = Math.floor(_index / 3);
        const _columnIndex = _index % 3;
        let _position: Vec2 = [
          valuePosition[0] + _columnIndex,
          valuePosition[1] + _rowIndex,
        ];
      });
    });

    if (this.selectedPosition) {
      this.drawSquareLines(
        [
          this.selectedPosition[0] * CELL_SIZE,
          this.selectedPosition[1] * CELL_SIZE,
        ],
        CELL_SIZE,
        COLORS.HIGHLIGHT
      );
    }

    this.filledPositions.map((position) => {
      this.drawSquareLines(
        [position[0] * CELL_SIZE, position[1] * CELL_SIZE],
        CELL_SIZE,
        COLORS.VALID
      );
    });
  }

  private drawSquareLines(origin: Vec2, size: number, color: Vec4): void {
    this.context.strokeStyle = this.rgba(color);

    this.context.beginPath();
    this.context.moveTo(origin[0], origin[1]);
    this.context.lineTo(origin[0] + size, origin[1]);
    this.context.lineTo(origin[0] + size, origin[1] + size);
    this.context.lineTo(origin[0], origin[1] + size);
    this.context.lineTo(origin[0], origin[1]);
    this.context.stroke();
  }

  private drawZoneCells(
    dataValues: number[][],
    guessValues: number[][][],
    shadowValues: number[][],
    origin: Vec2,
    size: number,
    color: Vec4,
    textColor: Vec4
  ): void {
    [...Array(9).keys()].map((index) => {
      const rowIndex = Math.floor(index / 3);
      const columnIndex = index % 3;
      const position: Vec2 = [
        origin[0] + columnIndex * size,
        origin[1] + rowIndex * size,
      ];
      const values: number | number[] =
        dataValues[rowIndex][columnIndex] || guessValues[rowIndex][columnIndex];

      this.drawSquareLines(position, size, color);

      if (!shadowValues[rowIndex][columnIndex]) {
        this.context.fillStyle = this.rgba(COLORS.SHADOW);
        this.context.fillRect(position[0], position[1], CELL_SIZE, CELL_SIZE);
      }

      this.context.fillStyle = this.rgba(textColor);

      if (isNaN(Number(values))) {
        this.context.font = "10px Arial";

        (values as number[]).map((value, index) => {
          const rowIndex = Math.floor(index / 3);
          const columnIndex = index % 3;

          if (value) {
            this.context.fillText(
              `${value}`,
              position[0] + (size / 3) * columnIndex + size / 3 / 2.6,
              position[1] + (size / 3) * rowIndex + size / 3 / 1.5
            );
          }
        });
      } else {
        this.context.font = "24px Arial";

        this.context.fillText(
          `${values}`,
          position[0] + size / 2.5,
          position[1] + size / 1.6
        );
      }
    });
  }

  private drawZoneBackground(origin: Vec2, color: Vec4): void {
    this.context.fillStyle = this.rgba(color);
    this.context.fillRect(origin[0], origin[1], ZONE_SIZE, ZONE_SIZE);
  }

  private rgba(values: Vec4): string {
    return `rgba(${values.join(", ")})`;
  }
}

export default Scene;

export { SceneInputEvent };
