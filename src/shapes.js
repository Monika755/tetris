export const shapes = {
  I: { shape: [[1, 1, 1, 1]], color: "cyan" },
  O: { shape: [[1, 1], [1, 1]], color: "yellow" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "purple" },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: "orange" },
  J: { shape: [[0, 1], [0, 1], [1, 1]], color: "blue" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "green" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "red" }
};

export const getRandomPiece = () => {
  const keys = Object.keys(shapes);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  const randomShape = shapes[randKey];
  return {
    shape: randomShape.shape,
    color: randomShape.color,
    row: 0,
    col: 3
  };
};
