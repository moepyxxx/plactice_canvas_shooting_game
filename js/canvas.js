class Canvas2DUtility {
  constructor(canvas) {
    this.canvasElement = canvas;
    this.context2d = canvas.getContext("2d");
  }

  get canvas() {
    return this.canvasElement;
  }

  get context() {
    return this.context2d;
  }

  imageLoader(path, callback) {
    let target = new Image();
    target.addEventListener(
      "load",
      () => {
        callback(target);
      },
      false
    );
    target.src = path;
  }

  drawRect(x, y, width, height, color) {
    if (color != null) {
      this.context2d.fillStyle = color;
    }
    this.context2d.fillRect(x, y, width, height);
  }

  drawText(text, x, y, color, width) {
    if (color != null) {
      this.context2d.fillStyle = color;
    }
    this.context2d.fillText(text, x, y, width);
  }
}
