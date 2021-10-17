//***** EXPERIMENTATION ****
//
// console.log(d3.select("body").node().clientWidth)
//
// window.addEventListener('resize', function(event){
//   let windowWidth = d3.select("body").node().clientWidth
//   console.log("resized");
//   console.log(windowWidth)
//   if (windowWidth < 1400) {
//     console.log("let's change the map size!")
//     wMap = 700
//     hMap = 500
//     d3.select("#map-canvas").remove()
//     d3.select("#map-canvas-inset").remove()
//     drawMap()
//
//   }
// })

// let width = 600
// let height = 380
// let wMap = 800
// let hMap = 600


// drawLineGraph()
// drawBarGraph()
// drawMap()

window.addEventListener('resize', function(event) {
  windowWidth = d3.select("body").node().clientWidth
  d3.select("#svg-climate").remove()
  d3.select("#svg-energy").remove()
  d3.select("#map-canvas").remove()
  d3.select("#map-canvas-inset").remove()
  setDim()
  drawLineGraph()
  drawBarGraph()
  drawMap()
})
