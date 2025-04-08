// @ts-ignore
import init, { Sudoku } from "../dist/lib";
import { Vec2 } from "./type";

import { App } from "./App";
import Scene, { SceneInputEvent } from "./Scene";
import SceneEvents from "./SceneEvents";

type State = {
  selectedPosition: Vec2 | null;
  autoFill: boolean;
  shuffleCount: number;
  difficulty: number;
  finished: boolean;
};

window.addEventListener("load", () => {
  init().then(() => {
    const app = new App("app", "Sudoku");
    app.render();

    const $debug: HTMLPreElement = app.$container.querySelector("#debug")!;
    const scene = new Scene(app.$container.querySelector("#scene")!);
    const sceneEvents = new SceneEvents({
      $canvas: app.$container.querySelector("#scene")!,
      $inputButtons: [
        ...app.$container.querySelectorAll(".inputs__button").values(),
      ] as HTMLElement[],
      $generateButton: app.$container.querySelector("#generate")!,
      $autoFillInput: app.$container.querySelector("#auto-fill")!,
      $shuffleCountInput: app.$container.querySelector("#shuffle-count")!,
      $shuffleCountText: app.$container.querySelector("#shuffle-count-value")!,
      $difficultyInput: app.$container.querySelector("#difficulty")!,
      $difficultyText: app.$container.querySelector("#difficulty-value")!,
    });

    //
    const sudoku = new Sudoku();
    const state: State = {
      selectedPosition: null,
      autoFill: false,
      shuffleCount: 10,
      difficulty: 1,
      finished: false,
    };

    //
    const resetSceneHighltedPosition = () => {
      setTimeout(() => {
        scene.filledPositions = [];
      }, 500);
    };
    const onInput = (data: SceneInputEvent) => {
      if (data.position) {
        state.selectedPosition = data.position;
        scene.selectedPosition = data.position;
      }

      if ((data.value || 0 === data.value) && state.selectedPosition) {
        if (!sudoku.update_cell(state.selectedPosition, data.value)) {
          alert(
            `unable to update [${state.selectedPosition.join(", ")}] with ${
              data.value
            }`
          );
        } else if (sudoku.is_filled()) {
          state.finished = true;

          setTimeout(() => {
            alert("finished!");
          }, 1000);
        } else {
          scene.filledPositions = [state.selectedPosition];
          resetSceneHighltedPosition();
        }
      }
    };

    // events
    sceneEvents.$eventListener.addEventListener(
      "position-selected",
      (event: any) => {
        onInput(event.detail);
      }
    );
    sceneEvents.$eventListener.addEventListener(
      "input-selected",
      (event: any) => {
        onInput(event.detail);
      }
    );
    sceneEvents.$eventListener.addEventListener("generate-new", () => {
      sudoku.generate(state.shuffleCount, state.difficulty);
      state.finished = false;
    });
    sceneEvents.$eventListener.addEventListener("auto-fill", (event: any) => {
      state.autoFill = Boolean(event.detail.autoFill);
    });
    sceneEvents.$eventListener.addEventListener(
      "update-difficulty",
      (event: any) => {
        state.difficulty = Number(event.detail.difficulty);
      }
    );
    sceneEvents.$eventListener.addEventListener(
      "update-difficulty",
      (event: any) => {
        state.difficulty = Number(event.detail.difficulty);
      }
    );

    // feels more "natural" as change is too quick in render loop
    setInterval(() => {
      if (!state.finished && state.autoFill) {
        scene.filledPositions = sudoku.auto_fill();
        resetSceneHighltedPosition();
      }
    }, 1000);

    // render loop
    let loop = 0;
    const animate: FrameRequestCallback = () => {
      if (loop > 0) {
        $debug.innerText = sudoku.is_filled()
          ? "filled and valid"
          : "not filled";

        scene.render(sudoku.data, sudoku.guess_data);
      }

      loop = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
});
