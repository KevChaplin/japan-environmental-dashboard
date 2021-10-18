// Set dimensions for svg elements
const setDim = () => {
  let windowWidth = d3.select("body").node().clientWidth
  let windowHeight = window.innerHeight

  // Size boundaries match media queries in styles.css
  if (windowWidth < 770) {
    // For smaller screens
    width = 0.9 * windowWidth
    height = 0.8 * windowWidth
    wMap = 0.8 * windowWidth
    hMap = 0.7 * windowWidth
    d3.select("#grid-container")
      .style("height", "auto")
    // For laptop / larger tablets
  } else if (windowWidth < 1200) {
    width = 0.45 * windowWidth
    height = 0.8 * width
    wMap = 0.75 * windowWidth
    hMap = 0.5 * windowWidth
    d3.select("#grid-container")
      .style("height", `${height + hMap}px`)
    // For larger screens
  } else {
    width = 0.3 * windowWidth
    height = 0.35 * windowHeight
    wMap = 0.5 * windowWidth
    hMap =  0.6* windowHeight
    d3.select("#grid-container")
        .style("height", "100vh")
  }
}

setDim()
