export const NeuPreview = (() => {
  /**
   * Lighten or Darken Color
   * @param {String} color The hex color code (with or without # prefix).
   * @param {Int} percent
   */
  function lightenDarkenColor(color, percent) {
    var num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      B = ((num >> 8) & 0x00ff) + amt,
      G = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  function txtColor(color) {
    let rgb = color
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

    let colorBrightness = Math.round(rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    let lightColor = Math.round(255 * 299 + 255 * 587 + 255 * 114) / 1000;
    if (Math.abs(colorBrightness < lightColor / 2)) {
      return '#ffffff';
    } else {
      return '#000000';
    }
  }

  return {
    lightenDarkenColor,
    txtColor,
  };
})();
