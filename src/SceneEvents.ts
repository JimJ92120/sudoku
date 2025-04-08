import { Vec2 } from "./type";

import { CELL_SIZE } from "./options";

type SceneInputEvent = {
  position?: Vec2;
  value?: number;
};

type SceneEventsElements = {
  $canvas: HTMLCanvasElement;
  $inputButtons: HTMLElement[];
  $generateButton: HTMLElement;
  $autoFillInput: HTMLInputElement;
  $shuffleCountInput: HTMLInputElement;
  $shuffleCountText: HTMLElement;
  $difficultyInput: HTMLInputElement;
  $difficultyText: HTMLElement;
  $restartButton: HTMLElement;
  $eraseButton: HTMLElement;
};

enum EventName {
  PositionSelected = "position-selected",
  InputSelected = "input-selected",
  Generate = "generate",
  AutoFill = "auto-fill",
  DifficultyUpdated = "difficulty-updated",
  ShuffleCountUpdated = "shuffle-count-updated",
  Restart = "restart",
  Erase = "erase",
}

class SceneEvents {
  private $eventListener: HTMLElement;
  private elements: SceneEventsElements;

  // private selectedPosition: Vec2 | null = null;

  constructor(elements: SceneEventsElements) {
    this.$eventListener = document.createElement("div") as HTMLElement;
    this.elements = elements;

    this.setEventListeners();
  }

  addEventListener(eventName: EventName, eventCallback: (event?: any) => void) {
    this.$eventListener.addEventListener(eventName, (event: any) =>
      eventCallback(event)
    );
  }

  private setEventListeners(): void {
    this.elements.$canvas.addEventListener("click", (event: MouseEvent) =>
      this.onCanvasClickCallback(event)
    );
    this.elements.$inputButtons.map(($button) => {
      $button.addEventListener("click", (event: MouseEvent) => {
        this.onInputButtonCallback(event);
      });
    });
    this.elements.$generateButton.addEventListener("click", () => {
      this.onGenerateButtonEventCallback();
    });
    this.elements.$autoFillInput.addEventListener("change", () =>
      this.onAutoFillInputEventCallback()
    );
    this.elements.$shuffleCountInput.addEventListener("change", () =>
      this.onShuffleCountInputEventCallback()
    );
    this.elements.$difficultyInput.addEventListener("change", () =>
      this.onDifficultyInputEventCallback()
    );
    this.elements.$restartButton.addEventListener("click", () => {
      this.onRestartButtonkEventCallback();
    });
    this.elements.$eraseButton.addEventListener("click", () => {
      this.onEraseButtonEventCallback();
    });
  }

  private onCanvasClickCallback(event: MouseEvent): void {
    const rect = this.elements.$canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.$eventListener.dispatchEvent(
      new CustomEvent(EventName.PositionSelected, {
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

  private onInputButtonCallback(event: MouseEvent): void {
    const $target: HTMLElement = event.target as HTMLElement;
    const value = $target.getAttribute("data-value");

    this.$eventListener.dispatchEvent(
      new CustomEvent(EventName.InputSelected, {
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

  private onGenerateButtonEventCallback(): void {
    this.$eventListener.dispatchEvent(new CustomEvent(EventName.Generate));
  }

  private onAutoFillInputEventCallback(): void {
    this.$eventListener.dispatchEvent(
      new CustomEvent(EventName.AutoFill, {
        detail: {
          autoFill: this.elements.$autoFillInput.checked,
        },
      })
    );
  }

  private onDifficultyInputEventCallback(): void {
    const newValue = Number(this.elements.$difficultyInput.value) || 1;

    this.$eventListener.dispatchEvent(
      new CustomEvent(EventName.DifficultyUpdated, {
        detail: {
          difficulty: newValue,
        },
      })
    );

    this.elements.$difficultyText.innerText = String(newValue || "0");
  }

  private onShuffleCountInputEventCallback(): void {
    const newValue = Number(this.elements.$shuffleCountInput.value) || 1;

    this.$eventListener.dispatchEvent(
      new CustomEvent(EventName.ShuffleCountUpdated, {
        detail: {
          shufflCount: newValue,
        },
      })
    );

    this.elements.$shuffleCountText.innerText = String(newValue || "0");
  }

  private onRestartButtonkEventCallback(): void {
    this.$eventListener.dispatchEvent(new CustomEvent(EventName.Restart));
  }

  private onEraseButtonEventCallback(): void {
    this.$eventListener.dispatchEvent(new CustomEvent(EventName.Erase));
  }
}

export default SceneEvents;

export { SceneInputEvent, EventName };
