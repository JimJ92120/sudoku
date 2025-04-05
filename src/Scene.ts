import { Vec2, Vec4, VEC_3 } from "./type";

import {
  SCENE_WIDTH,
  SCENE_HEIGHT,
  ZONE_SIZE,
  COLORS,
  CELL_SIZE,
} from "./options";

class Scene {
  $canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private selectedPosition: Vec2 | null = null;

  constructor($canvas: HTMLCanvasElement) {
    this.$canvas = $canvas;
    this.context = this.$canvas.getContext("2d")!;

    this.$canvas.width = SCENE_WIDTH;
    this.$canvas.height = SCENE_HEIGHT;
    this.$canvas.style.backgroundColor = this.rgba(COLORS.BACKGROUND);

    this.$canvas.addEventListener("click", (event: MouseEvent) =>
      this.onMouseClickCallback(event)
    );
  }

  onMouseClickCallback(event: MouseEvent): void {
    const rect = this.$canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.selectedPosition = [
      Math.floor(x / CELL_SIZE),
      Math.floor(y / CELL_SIZE),
    ];

    this.$canvas.dispatchEvent(
      new CustomEvent("position-selected", { detail: this.selectedPosition })
    );
  }

  //
  render(data: number[][], guessData: number[][][]): void {
    this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

    [...Array(9).keys()].map((index) => {
      const rowIndex = Math.floor(index / 3);
      const columnIndex = index % 3;

      const color =
        (!(rowIndex % 2) && columnIndex % 2) ||
        (rowIndex % 2 && !(columnIndex % 2))
          ? COLORS.SECONDARY
          : COLORS.PRIMARY;
      const position: Vec2 = [columnIndex * ZONE_SIZE, rowIndex * ZONE_SIZE];
      const valuePosition: Vec2 = [rowIndex * 3, columnIndex * 3];

      this.drawZoneBackground(position, color);
      this.drawZoneCells(
        VEC_3.map((index) =>
          data[valuePosition[0] + index].slice(
            valuePosition[1],
            valuePosition[1] + 3
          )
        ),
        VEC_3.map((index) =>
          guessData[valuePosition[0] + index].slice(
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

export {};
