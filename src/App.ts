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
    <pre id="map"></pre>
  </p>

  <button id="generate">Generate</button>

  <div class="controls">
    ${[...Array(9).keys()].reduce(
      (_result, index) =>
        _result +
        `<div class="controls__button" data-value="${index + 1}">${
          index + 1
        }</div>`,
      ""
    )}
  </div>\

  <style>
    #scene {
      cursor: pointer;
    }
    .controls {
      display: flex;
      flex-flow: row wrap;
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
      margin-top: 1rem;
    }
    .controls__button {
      display: inline;
      width: calc((100% - 3rem) / 3);
      box-sizing: border-box;
      border: 1px solid black;
      margin: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
    }
    .controls__button--selected {
      border: 1px solid green;
      color: green;
    }
  </style>
    `;
  }
}

export { App };
