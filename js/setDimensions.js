// Set dimensions
const setDim = () => {
  let windowWidth = d3.select("body").node().clientWidth
  let windowHeight = window.innerHeight

  if (windowWidth < 770) {
    width = 0.9 * windowWidth
    height = 0.8 * windowWidth
    wMap = 0.9 * windowWidth
    hMap = 0.75 * windowWidth
  } else if (windowWidth < 1200) {
    width = 0.45 * windowWidth
    height = 0.8 * width
    wMap = 0.9 * windowWidth
    hMap = 0.7 * windowWidth
    d3.select("#grid-container")
      .style("height", `${height + hMap}px`)
  } else {
    width = 0.4 * windowWidth
    height = 0.4 * windowHeight
    wMap = 0.4 * windowWidth
    hMap =  0.6* windowHeight
  }
}

setDim()
