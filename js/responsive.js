// WHen window size is changed, remove all visulaizations; set dimensions for elements; redraw visulaizations (all reDraw functions check and use latest dimensions).
window.addEventListener('resize', function(event) {
  windowWidth = d3.select("body").node().clientWidth
  d3.select("#svg-climate").remove()
  d3.select("#svg-energy").remove()
  d3.select("#map-canvas").remove()
  d3.select("#map-canvas-inset").remove()
  setDim()
  reDrawClimate()
  reDrawEnergy()
  reDrawMap()
})
