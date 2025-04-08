import init, { Sudoku } from "../dist/lib";
import { Vec2 } from "./type";

import { App } from "./App";
import Scene, { SceneInputEvent } from "./Scene";

window.addEventListener("load", () => {
  init().then(() => {
    const app = new App("app", "Sudoku");
    app.render();

    const $faceMap: HTMLPreElement = app.$container.querySelector("#map")!;
    const scene = new Scene(
      app.$container.querySelector("#scene")!,
      [
        ...app.$container.querySelectorAll(".controls__button").values(),
      ] as HTMLElement[],
      app.$container.querySelector("#generate")!
    );

    //
    const sudoku = new Sudoku();
    // sudoku.auto_fill();

    let selectedPosition: Vec2 | null = null;
    const onInput = (data: SceneInputEvent) => {
      if (data.position) {
        selectedPosition = data.position;

        console.log(selectedPosition);
      }

      if ((data.value || 0 === data.value) && selectedPosition) {
        console.log(
          `updating [${selectedPosition.join(", ")}] with ${data.value}...`
        );

        if (!sudoku.update_cell(selectedPosition, data.value)) {
          alert(
            `unable to update [${selectedPosition.join(", ")}] with ${
              data.value
            }`
          );
        } else if (sudoku.is_filled()) {
          setTimeout(() => {
            alert("finished!");
          }, 1000);
        }
      }
    };

    scene.$eventListener.addEventListener("position-selected", (event: any) => {
      onInput(event.detail);

      // sudoku.update_cell(event.detail as Vec2, random);
    });
    scene.$eventListener.addEventListener("input-selected", (event: any) => {
      onInput(event.detail);
    });
    scene.$eventListener.addEventListener("generate-new", (event: any) => {
      console.log("generating new data requested...");

      sudoku.generate();
    });

    let loop = 0;
    const animate: FrameRequestCallback = () => {
      if (loop > 0) {
        $faceMap.innerText = sudoku.is_filled()
          ? "filled and valid"
          : "not filled";

        scene.render(sudoku.data, sudoku.guess_data);
      }

      loop = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
});
