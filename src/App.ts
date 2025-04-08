class App {
  $container: HTMLElement;
  private title: string;

  constructor(containerId: string, title: string) {
    this.$container = document.querySelector(`#${containerId}`)!;
    this.title = title;
  }

  render() {
    this.$container.innerHTML = `
  <h1>${this.title}</h1>

  <canvas id="scene"></canvas>

  <p>
    <pre id="debug"></pre>
  </p>

  <div class="controls">
    <div>
      <button id="generate">Generate</button>
      <button id="restart">Restart</button>
    </div>
    <div>
      <button id="erase">Erase</button>
      <button id="undo">Undo</button>
    </div>
    <div>
      <label>Auto-fill</label>
      <input type="checkbox" id="auto-fill"></input>
    </div>
    <div>
      <label>Shuffle count: <span id="shuffle-count-value">1</span></label>
      <input type="range" id="shuffle-count" value="1"></input>
    </div>
    <div>
      <label>Difficulty: <span id="difficulty-value" max="100">1</span></label>
      <input type="range" id="difficulty" value="1" max="80"></input>
    </div>

    <div class="inputs">
      ${[...Array(9).keys()].reduce(
        (_result, index) =>
          _result +
          `<div class="inputs__button" data-value="${index + 1}">${
            index + 1
          }</div>`,
        ""
      )}
    </div>
  </div>

  <style>
    #scene {
      cursor: pointer;
    }
    .controls {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
    }
    .controls > * {
      margin-bottom: 1rem
    }

    #auto-fill {
      position: relative;
      top: 0.15rem;
    }
    #difficulty {
      position: relative;
      top: 0.25rem;
    }

    .inputs {
      display: flex;
      flex-flow: row wrap;
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
      align-items: center;
      justify-content: center;
    }
    .inputs__button {
      display: inline;
      width: calc((100% - 3rem) / 3);
      box-sizing: border-box;
      border: 1px solid black;
      margin: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
    }
    .inputs__button--selected {
      border: 1px solid green;
      color: green;
    }
  </style>
    `;
  }
}

export { App };
