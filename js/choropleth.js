var dataUrl
const japanMapDataUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/japan/jp-prefectures.json"
const dataBaseUrl = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"

var dataScale
var climateDataPref = []

// Colors for representing climate data differential (z-axis). Array of colors from d3-scale-chromatic. Color scale reversed to match data.
const colors = []
d3.schemeRdYlBu[9].forEach(color => colors.unshift(color))

// Year of data displayed, values are initial and will be overwritten once fetch coplete
var currentYear = 1975
var yearRange = [1975,2019]

// For animation
var timer
var playing = false

// Data Indicator Ids as referenced on https://dashboard.e-stat.go.jp/en/static/api#skip_to_context
// Used to construct url for data retrieval from API - data initialized to Average Air Temperature
// Array:
  // [ Average Air Temperature / Year / Prefecture,
  // Highest Monthly Average Air Temperature / Year / Prefecture,
  // Lowest Monthly Average Air Temperature / Year / Prefecture,
  // Yearly precipitation / Prefecture ]
const indicatorIdArr = ["0102010000000010010", "0102010000000010020", "0102010000000010030", "0102020300000010010"]
var indicatorId = indicatorIdArr[0]

// Append svg for line graph - function so it can be called after removing svg for resizing/updating
const addSvgMap = () => {
  svgMap = d3.select("#map")
                    .append("svg")
                      .attr("id", "map-canvas")
                      .attr("width", wMap)
                      .attr("height", hMap)
                      .style("stroke", "white")
                      .attr("style", "outline: thin solid black;")
}

// Set title for map based on selected data
var mapTitle
const mapTitles = [
  "Average temperature (°C)",
  "Highest temperature of monthly averages of daily highest (°C)",
  "Lowest temperature among monthly averages of daily lowest (°C)",
  "Yearly Precipitation (mm)"
]
const updateMapTitle = () => {
  let mapTitlesIndex = document.getElementById("select-data-map").selectedIndex
  mapTitle = `${mapTitles[mapTitlesIndex]} ${yearRange[0]} - ${yearRange[1]}`
  d3.select("#map-title").text(`${mapTitle}`)
}

// Function to change data source: reset timer; create new indicatorid based on selection, fetch new data.
const changeDataMap = () => {
  resetTimer()
  currentYear = yearRange[1]
  slider.value([currentYear])
  let indicatorIndex = document.getElementById("select-data-map").selectedIndex
  indicatorId = indicatorIdArr[indicatorIndex]
  d3.select("#map-canvas").remove()
  d3.select("#map-canvas-inset").remove()
  addSvgMap()
  addclimateDataPref()
  updateMap()
  updateMapTitle()
}

// Update map and text based on currentYear value
const updateMap = () => {
  d3.select("#year")
    .text(currentYear)

  d3.selectAll(".prefecture")
    .transition()
    .duration(100)
    .attr("fill", prefDataItem => {
      let id = prefDataItem.properties.NAME_1
      let pref = climateDataPref.find(item => {
        return ( (item.year === currentYear) && (item.prefecture === id) )
      })
      let value = pref.value
      return dataScale(value)
  })
}

// Redraw function after resizing - include re-appending plot svg
const reDrawMap = () => {
  addSvgMap()
  drawMap()
}

let sliderTicks = null
// Slider for year
let slider = d3.sliderHorizontal()
                .value([yearRange[1]])
                .min(yearRange[0])
                .max(yearRange[1])
                .step(1)
                .displayValue(false)
                .tickValues(sliderTicks)
                .tickFormat(d3.format("d"))
                .on('onchange', (val) => {
                  currentYear = val
                  updateMap()
                })

// Animate map data by iterating through years
const animateMap = () => {
  d3.select("#play-btn")
    .on("click", function() {
      if(playing == false) {
        timer = setInterval( function() {
          if(currentYear < yearRange[1]) { currentYear ++}
          else {currentYear = yearRange[0]}
          slider.value([currentYear])
          updateMap()
        }, 500)
        d3.select("#play-btn-text").text("Stop")
        playing = true
      } else {
        resetTimer()
      }
    })
}

// Reset timer
const resetTimer = () => {
  clearInterval(timer)
  d3.select("#play-btn-text").text("Play")
  playing = false
}

// --- DRAW MAP function (to be called once data fetched from API) ---
const drawMap = () => {

  let wMap2 = wMap / 3
  let hMap2 = hMap / 2
  let legendAxisHeight = hMap / 3

  // Set slider width
  slider.width(wMap / 3)

  // svg for inset map of Okinawa region
  const svgMapInset = d3.select("#map")
                        .append("svg")
                          .attr("id", "map-canvas-inset")
                          .attr("width", wMap2)
                          .attr("height", hMap2)
                          .style("stroke", "whMapite")
                          .attr("style", "outline: thin solid black;")

  // Set projection, main map and inset map
  const projection = d3.geoMercator()
                        .center([137.5,36])
                        .scale(2.9 * hMap)
                        .translate([wMap / 2, hMap / 1.5]);

  const projectionInset = d3.geoMercator()
                        .center([127.9,26.5])
                        .scale(6 * hMap)
                        .translate([wMap2 / 2, hMap2 / 2]);

  // set path generator, main map and inset map
  const geoGenerator = d3.geoPath()
                          .projection(projection)

  const geoGeneratorInset = d3.geoPath()
                              .projection(projectionInset)


  // Update indicated year
  d3.select("#year").text(currentYear)

  // Get date range (years) of data
  yearRange = d3.extent(climateDataPref, d => d.year)

  // Colors representing climate data variance
  dataScale = d3.scaleQuantile()
                  .domain(d3.extent(climateDataPref, d => d.value))
                  .range(colors)

  // Remove old legend when updating to new data
  d3.select("#legend").remove()

  // Legend scale
  const legendScale = d3.scaleLinear()
                        .domain(d3.extent(climateDataPref, d => d.value))
                        .range([legendAxisHeight, 0])

  // Legend
  const legendAxis = d3.axisRight(legendScale)
                        .tickValues( dataScale.quantiles().concat(legendScale.domain()) )
                        .tickFormat(indicatorId === indicatorIdArr[3] ? d3.format(".0f") : d3.format(".1f"))

  // Create map using d3.geoPath on converted topojson data
  svgMap.selectAll("path")
        .data(prefectureData)
        .enter()
        .append("path")
        .attr("d", geoGenerator)
        .attr("class", "prefecture")
        // Prefecture name used to match and obtain climate data.
        .attr("fill", prefDataItem => {
          let id = prefDataItem.properties.NAME_1
          let pref = climateDataPref.find(item => {
            return ( (item.year === currentYear) && (item.prefecture === id) )
          })
          let value = pref.value
          return dataScale(value)
        })

  // Create inset map of Okinawa region
  svgMapInset.selectAll("path")
              .data(prefectureData)
              .enter()
              .append("path")
              .attr("d", geoGeneratorInset)
              .attr("class", "prefecture")
              // Prefecture name used to match and obtain climate data.
              .attr("fill", prefDataItem => {
                let id = prefDataItem.properties.NAME_1
                let pref = climateDataPref.find(item => {
                  return ( (item.year === currentYear) && (item.prefecture === id) )
                })
                let value = pref.value
                return dataScale(value)
              })

  // Add legend-axis
  svgMap.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${0.9 * wMap}, ${0.1 * hMap})`)
        .call(legendAxis)
        .selectAll("rect")
          .data(colors)
          .enter()
          .append("rect")
            .attr("width",  20)
            .attr("height", legendAxisHeight / 9)
            .attr("fill", d => d)
            .style("stroke", "none")
            .attr("transform", (d, i) => `translate(-20, ${legendAxisHeight - (legendAxisHeight * (i + 1) / 9)})`)

  // -- Slider --
  // Remove old slider when updating to new data
  d3.select("#slider").remove()

  // If width of map is less than 650 limit tick values on slider
  sliderTicks = wMap < 650 ?  yearRange : null
  slider.tickValues(sliderTicks)

  // Add slider for year
  svgMap.append('g')
        .attr("id", "slider")
        .attr('transform', () => `translate(${(2 * wMap / 3) - 40}, ${hMap - 50})`)
        .call(slider)
        .append("text")
          .attr("pointer-events", "none")
          .attr("id", "year")
          .text(currentYear)
          .attr("text-anchor", "middle")
          .attr("transform", () => `translate(${(wMap / 6)}, -20)`)


  // Add "button" (rect element) to slider for play/stop functionality
  svgMap.select("#slider")
        .append("g")
        .attr("id", "btn-marker")
        .attr("transform", () => `translate(${wMap/3 -20}, -25)`)

  // Add "button" (rect element) to slider for play/stop functionality & Add text to button
  let btnMarker = d3.select("#btn-marker")

  btnMarker.append("rect")
            .attr("id", "play-btn")
            .attr("width",  40)
            .attr("height", 30)
            .attr("transform", "translate(-20, -15)")

  btnMarker.append("text")
            .attr("id", "play-btn-text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(0, 5)")
            .text("Play")

  // div is initially hidden, visble after svg created to prevent "pop-in"
  d3.select("#choropleth").style("visibility", "visible")
}

// Fetch climate data (prefectural) function
const addclimateDataPref = () => {
  dataUrl = `${dataBaseUrl}&IndicatorCode=${indicatorId}`
  d3.json(dataUrl).then(
    (data, error) => {
      if(error) {
        console.log(error)
      } else {
        // Hide loading animation
        d3.select(".map-loading").style("visibility", "hidden")
        let dataAll =data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
        climateDataPref = dataAll.map(item => {
          return {
                year: parseInt(item.VALUE["@time"].substring(0,4)),
                prefecture: prefectures[parseInt(item.VALUE["@regionCode"].substring(0,2)) -1],
                value: parseFloat(item.VALUE["$"])
          }
        })
        // set dateRange to range of dates of data, and set current displayed data to latest date's values
        yearRange = d3.extent(climateDataPref, d => d.year)
        currentYear = yearRange[1]
        // Once map data and climate data obtained, draw map
        drawMap()
        animateMap()
        updateMapTitle()
      }
    }
  )
}

// On initial load, add svg, run addClimtateData fuction (which adds data and draws graph)
addSvgMap()

// Import data - map data is converted from topojson format; climate data imported after map data loaded
d3.json(japanMapDataUrl).then(
  (data, error) => {
    // Show loading animation
    d3.select(".map-loading").style("visibility", "visible")
    if(error) {
      console.log(error)
    } else {
      prefectureData = topojson.feature(data, data.objects.JPN_adm1).features
      // fix error in data "Naosaki" should be "Nagasaki" - below is temporary fix, issue raised on data repository 2021/10/07
      prefectureData[26].properties["NAME_1"] = "Nagasaki"
      // Once map data is obtained, fetch climate data
      addclimateDataPref()
    }
  }
)
