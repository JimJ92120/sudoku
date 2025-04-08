import { Vec2 } from "./type";

import { CELL_SIZE } from "./options";

type SceneInputEvent = {
  position?: Vec2;
  value?: number;
};

type SceneEventsElements = {
  $canvas: HTMLCanvasElement;
  $inputButtons: HTMLElement[];
  $generateButton: HTMLButtonElement;
  $autoFillInput: HTMLInputElement;
  $shuffleCountInput: HTMLInputElement;
  $shuffleCountText: HTMLElement;
  $difficultyInput: HTMLInputElement;
  $difficultyText: HTMLElement;
};

class SceneEvents {
  readonly $eventListener: HTMLElement;
  private elements: SceneEventsElements;

  // private selectedPosition: Vec2 | null = null;

  constructor(elements: SceneEventsElements) {
    this.$eventListener = document.createElement("div") as HTMLElement;
    this.elements = elements;

    this.elements.$canvas.addEventListener("click", (event: MouseEvent) =>
      this.onCanvasClickCallback(event)
    );
    this.elements.$inputButtons.map(($button) => {
      $button.addEventListener("click", (event: MouseEvent) => {
        this.onInputButtonClickCallback(event);
      });
    });
    this.elements.$generateButton.addEventListener("click", () => {
      this.onGenerateButtonClickEventCallback();
    });
    this.elements.$autoFillInput.addEventListener("change", () =>
      this.onAutoFillInputCallback()
    );
    this.elements.$shuffleCountInput.addEventListener("change", () =>
      this.onShuffleCountInputCallback()
    );
    this.elements.$difficultyInput.addEventListener("change", () =>
      this.onDifficultyInputCallback()
    );
  }

  private onCanvasClickCallback(event: MouseEvent): void {
    const rect = this.elements.$canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.$eventListener.dispatchEvent(
      new CustomEvent("position-selected", {
        detail: {
          position: [Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE)],
        } as SceneInputEvent,
      })
    );

    // duplicated
    this.elements.$inputButtons.map(($element) => {
      $element.classList.remove("inputs__button--selected");
    });
  }

  private onInputButtonClickCallback(event: MouseEvent): void {
    const $target: HTMLElement = event.target as HTMLElement;
    const value = $target.getAttribute("data-value");

    this.$eventListener.dispatchEvent(
      new CustomEvent("input-selected", {
        detail: {
          value: "" !== value ? Number(value) : null,
        } as SceneInputEvent,
      })
    );

    this.elements.$inputButtons.map(($element) => {
      $element.classList.remove("inputs__button--selected");
    });
    $target.classList.add("inputs__button--selected");
  }

  private onGenerateButtonClickEventCallback(): void {
    this.$eventListener.dispatchEvent(new CustomEvent("generate-new"));
  }

  private onAutoFillInputCallback(): void {
    this.$eventListener.dispatchEvent(
      new CustomEvent("auto-fill", {
        detail: {
          autoFill: this.elements.$autoFillInput.checked,
        },
      })
    );
  }

  private onDifficultyInputCallback(): void {
    const newValue = Number(this.elements.$difficultyInput.value) || 1;

    this.$eventListener.dispatchEvent(
      new CustomEvent("update-difficulty", {
        detail: {
          difficulty: newValue,
        },
      })
    );

    this.elements.$difficultyText.innerText = String(newValue || "0");
  }

  private onShuffleCountInputCallback(): void {
    const newValue = Number(this.elements.$shuffleCountInput.value) || 1;

    this.$eventListener.dispatchEvent(
      new CustomEvent("update-shuffle-count", {
        detail: {
          shufflCount: newValue,
        },
      })
    );

    this.elements.$shuffleCountText.innerText = String(newValue || "0");
  }
}

export default SceneEvents;

export { SceneInputEvent };
