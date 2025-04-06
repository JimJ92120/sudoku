import init, { Sudoku } from "../dist/lib";
import { Vec2 } from "./type";

import { App } from "./App";
import Scene from "./Scene";

window.addEventListener("load", () => {
  init().then(() => {
    const app = new App("app", "Sudoku");
    app.render();

    const $faceMap: HTMLPreElement = app.$container.querySelector("#map")!;

    //
    const scene = new Scene(app.$container.querySelector("#scene")!);

    //
    const sudoku = new Sudoku();
    sudoku.generate();

    console.log(sudoku.data);
    console.log(sudoku.guess_data);

    // test fill randomly (non-valid board generated)
    setInterval(() => {
      const randomValue = Math.floor(Math.random() * 8) + 1;
      const randomPosition = [
        Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 8),
      ];

      sudoku.update_cell(randomPosition, randomValue);
      sudoku.auto_fill();
    }, 500);
    //

    scene.$canvas.addEventListener("position-selected", (event: any) => {
      const random = Math.floor(Math.random() * 8) + 1;

      sudoku.update_cell(event.detail as Vec2, random);
    });

    let loop = 0;
    const animate: FrameRequestCallback = () => {
      if (loop > 0) {
        $faceMap.innerText = "...";

        scene.render(sudoku.data, sudoku.guess_data);
      }

      loop = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
});
