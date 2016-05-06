export function distanceBetweenCoordinates(coordinate1, coordinate2) {
  // Source: http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  let p = 0.017453292519943295;    // Math.PI / 180
  let c = Math.cos;
  let a = 0.5 - c((coordinate2.latitude - coordinate1.latitude) * p) / 2 +
          c(coordinate1.latitude * p) * c(coordinate2.latitude * p) *
          (1 - c((coordinate2.longitude - coordinate1.longitude) * p)) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function distanceOfPolyline(coordinates) {
  if (coordinates.length < 2) {
    return 0;
  }
  let output = 0;
  for (let i = 1, len = coordinates.length; i < len; i++) {
    output += distanceBetweenCoordinates(coordinates[i - 1], coordinates[i]);
  }
  return output;
}

export function noop() {}

export function makeActionCreator(type, ...argNames) {
  if (type == null) {
    throw new TypeError('Action type is not defined');
  }
  return function (...args) {
    let action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}
