import { Vector, Sprite } from 'kontra';

export const scaleToFit = () => {
  // TODO (johnedvard) listen for window resize, debounce, and scale to fit mac height and width whilst keeping aspect ratio
};
export const isBoxCollision = (sprite1, sprite2) => {
  // TODO (johnedvard) also incorporate anchor
  if (!sprite1 || !sprite2) return false;
  return (
    sprite1.x < sprite2.x + sprite2.width &&
    sprite1.x + sprite1.width > sprite2.x &&
    sprite1.y < sprite2.y + sprite2.height &&
    sprite1.height + sprite1.y > sprite2.y
  );
};
export const lineIntersection = (p1, p2, p3, p4) => {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d == 0) return null; // parallel lines
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  if (u < 0.0 || u > 1.0) return null; // intersection point not between p1 and p2
  if (v < 0.0 || v > 1.0) return null; // intersection point not between p3 and p4
  const intersectionX = p1.x + u * (p2.x - p1.x);
  const intersectionY = p1.y + u * (p2.y - p1.y);
  let intersection = Vector(intersectionX, intersectionY);
  return intersection;
};

export const doesOwnNft = (seriesId, nftTokensForOwner) => {
  const token = nftTokensForOwner.find(
    (token) => token.token_id.split(':')[0] === seriesId
  );
  return !!token;
};

export const getNearLevelId = (tokenSeriesId) => {
  switch (tokenSeriesId) {
    case '2037':
      return 2;
    case '2036':
      return 3;
  }
};

export const createSprite = ({ x, y, scale, imgSrc }) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      const sprite = Sprite({
        x: x,
        y: y,
        anchor: { x: 0.5, y: 0.5 },
        width: 8,
        height: 8,
        image: image,
        scaleX: scale,
        scaleY: scale,
      });
      resolve(sprite);
    };
  });
};
