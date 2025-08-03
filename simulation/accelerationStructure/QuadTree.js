class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.userData = data;
  }
}

class Rectangle {
  constructor(x, y, w, h, data) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.left = x - w / 2;
    this.right = x + w / 2;
    this.top = y - h / 2;
    this.bottom = y + h / 2;
  }

  contains(point) {
    return (
      this.left <= point.x && point.x <= this.right &&
      this.top <= point.y && point.y <= this.bottom
    );
  }

  intersects(range) {
    return !(
      this.right < range.left || range.right < this.left ||
      this.bottom < range.top || range.bottom < this.top
    );
  }

  subdivide(quadrant) {
    switch (quadrant) {
      case 'ne':
        return new Rectangle(this.x + this.w / 4, this.y - this.h / 4, this.w / 2, this.h / 2);
      case 'nw':
        return new Rectangle(this.x - this.w / 4, this.y - this.h / 4, this.w / 2, this.h / 2);
      case 'se':
        return new Rectangle(this.x + this.w / 4, this.y + this.h / 4, this.w / 2, this.h / 2);
      case 'sw':
        return new Rectangle(this.x - this.w / 4, this.y + this.h / 4, this.w / 2, this.h / 2);
    }
  }
}

class QuadTree {
  DEFAULT_CAPACITY = 8;
  MAX_DEPTH = 8;

  constructor(boundary, capacity = this.DEFAULT_CAPACITY, _depth = 0) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;

    this.depth = _depth;
  }

  get children() {
    if (this.divided) {
      return [
        this.northeast,
        this.northwest,
        this.southeast,
        this.southwest
      ];
    } else {
      return [];
    }
  }

  subdivide() {
    this.northeast = new QuadTree(this.boundary.subdivide('ne'), this.capacity, this.depth + 1);
    this.northwest = new QuadTree(this.boundary.subdivide('nw'), this.capacity, this.depth + 1);
    this.southeast = new QuadTree(this.boundary.subdivide('se'), this.capacity, this.depth + 1);
    this.southwest = new QuadTree(this.boundary.subdivide('sw'), this.capacity, this.depth + 1);

    this.divided = true;

    for (const p of this.points) {
      const inserted =
        this.northeast.insert(p) ||
        this.northwest.insert(p) ||
        this.southeast.insert(p) ||
        this.southwest.insert(p);
    }

    this.points = null;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided) {
      if (
        this.points.length < this.capacity ||
        this.depth === this.MAX_DEPTH
      ) {
        this.points.push(point);
        return true;
      }

      this.subdivide();
    }

    return (
      this.northeast.insert(point) ||
      this.northwest.insert(point) ||
      this.southeast.insert(point) ||
      this.southwest.insert(point)
    );
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!range.intersects(this.boundary)) {
      return found;
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
      return found;
    }

    for (const p of this.points) {

      if (range.contains(p)) {
        found.push(p);
      }
    }

    return found;
  }

  get length() {
    if (this.divided) {
      return (
        this.northwest.length +
        this.northeast.length +
        this.southwest.length +
        this.southeast.length
      );
    }

    return this.points.length;
  }
}

export { Point, Rectangle, QuadTree }
