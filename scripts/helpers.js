// Generally helpful functions

function toRadians (a) {
    return (2*Math.PI*a/360);
}

let map_p5 = function (value, oldMin, oldMax, newMin, newMax) {
  let prop = (value - oldMin)/(oldMax - oldMin);
  let newVal = prop*(newMax - newMin) + newMin;
  return newVal;
}