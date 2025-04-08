// @ts-ignore
import init, { Game } from "../dist/lib";
import { Vec2 } from "./type";

import { App } from "./App";
import Scene, { SceneInputEvent } from "./Scene";
import SceneEvents, { EventName } from "./SceneEvents";

type State = {
  selectedPosition: Vec2 | null;
  autoFill: boolean;
  shuffleCount: number;
  difficulty: number;
  finished: boolean;
};

//
function resetSceneHighltedPosition(scene: Scene) {
  setTimeout(() => {
    scene.filledPositions = [];
  }, 500);
}
function onInput(
  scene: Scene,
  state: State,
  sudoku: Game,
  data: SceneInputEvent
) {
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
      resetSceneHighltedPosition(scene);
    }
  }
}

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
      $restartButton: app.$container.querySelector("#restart")!,
    });

    //
    const sudoku = new Game();
    const state: State = {
      selectedPosition: null,
      autoFill: false,
      shuffleCount: 10, // x100
      difficulty: 1,
      finished: false,
    };

    // events
    sceneEvents.addEventListener(EventName.PositionSelected, (event: any) =>
      onInput(scene, state, sudoku, event.detail)
    );
    sceneEvents.addEventListener(EventName.InputSelected, (event: any) =>
      onInput(scene, state, sudoku, event.detail)
    );
    //
    sceneEvents.addEventListener(EventName.Generate, () => {
      sudoku.generate(state.shuffleCount * 100, state.difficulty);
      state.finished = false;
    });
    sceneEvents.addEventListener(EventName.AutoFill, (event: any) => {
      state.autoFill = Boolean(event.detail.autoFill);
    });
    sceneEvents.addEventListener(EventName.DifficultyUpdated, (event: any) => {
      state.difficulty = Number(event.detail.difficulty);
    });
    sceneEvents.addEventListener(
      EventName.ShuffleCountUpdated,
      (event: any) => {
        state.shuffleCount = Number(event.detail.shufflCount);
      }
    );
    //
    sceneEvents.addEventListener(EventName.Restart, () => {
      console.log("restart");

      sudoku.restart();
    });

    // feels more "natural" as change is too quick in render loop
    setInterval(() => {
      if (!state.finished && state.autoFill) {
        scene.filledPositions = sudoku.auto_fill();
        resetSceneHighltedPosition(scene);
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
