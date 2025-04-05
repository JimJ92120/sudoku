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
    `;
  }
}

export { App };
