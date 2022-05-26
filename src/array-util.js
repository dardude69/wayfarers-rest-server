/* I'm not changing the Array prototype, I don't have the guts. */

module.exports = {

  linearToGrid: (linear, rowWidth) => {
    const grid = [];
    const rows = Math.ceil(linear.length / rowWidth);

    for (let row = 0; row < rows; ++row) {
      grid[row] = linear.slice(row * rowWidth, (row+1) * rowWidth);
    }

    return grid;
  }

}
