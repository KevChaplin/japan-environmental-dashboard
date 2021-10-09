const w = 1000
const h = 600
const legendAxisLength = w/3

const japanMapDataUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/japan/jp-prefectures.json"
const dataBaseUrl = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"

let dataScale
let temperatureData = []

// Construct url for data retrieval from API
// Data: Average Air Temperature / Year / Prefecture
let indicatorId = "0102010000000010010"
let dataUrl = `${dataBaseUrl}&IndicatorCode=${indicatorId}`

// Year of data displayed, values are initial and will be overwritten once fetch coplete
var currentYear = 1975
var yearRange = [1975,2019]
// For animation
let playing = false

// Slider for year
var slider = d3.sliderHorizontal()
                .value([yearRange[1]])
                .min(yearRange[0])
                .max(yearRange[1])
                .step(1)
                .width(300)
                .displayValue(false)
                .tickFormat(d3.format("d"))
                .on('onchange', (val) => {
                  currentYear = val
                  updateMap()
                })

// Update map and text based on currentYear value
const updateMap = () => {

  d3.select("#year")
    .text(currentYear)

  d3.selectAll(".prefecture")
    .transition()
    .duration(100)
    .attr("fill", prefDataItem => {
      let id = prefDataItem.properties.NAME_1
      let pref = temperatureData.find(item => {
        return ( (item.year === currentYear) && (item.prefecture === id) )
      })
      let avTemperature = pref.value
      return dataScale(avTemperature)
  })
}

// Animate map data by iterating through years
const animateMap = () => {
  var timer
  d3.select("#play-pause")
    .on("click", function() {
      if(playing == false) {
        timer = setInterval( function() {
          if(currentYear < yearRange[1]) { currentYear ++}
          else {currentYear = yearRange[0]}
          slider.value([currentYear])
          // d3.select("#slider").value([currentYear])
          updateMap()
        }, 500)
        d3.select(this).html("stop")
        playing = true
      } else {
        clearInterval(timer)
        d3.select(this).html("play")
        playing = false
      }
    })
}

// Colors for representing temperature differential (z-axis). Array of colors from d3-scale-chromatic. Color scale reversed to match data.
const colors = []
d3.schemeRdYlBu[9].forEach(color => colors.unshift(color))

// svg for prefectural map of data
const svgMap = d3.select("body")
                    .append("svg")
                    .attr("id", "map-canvas")
                    .attr("width", w)
                    .attr("height", h)
                    .style("fill", "green")
                    .style("stroke", "white")

// Set projection
const projection = d3.geoMercator()
                      .center([137.5,36])
                      .scale(2 * h)
                      .translate([w / 2, h / 2]);

// set path generator
const geoGenerator = d3.geoPath()
                    .projection(projection)

// Draw map function (to be called once data fetched from API)
const drawMap = () => {

  d3.select("#year").text(current)

  // Get date range (years) of data
  yearRange = d3.extent(temperatureData, d => d.year)

  // Colors representing temperature variance
  dataScale = d3.scaleQuantile()
                  .domain(d3.extent(temperatureData, d => d.value))
                  .range(colors)

  // Legend scale
  const legendScale = d3.scaleLinear()
                        .domain(d3.extent(temperatureData, d => d.value))
                        .range([0, legendAxisLength])

  // Legend
  const legendAxis = d3.axisBottom(legendScale)
                        .tickValues( dataScale.quantiles().concat(legendScale.domain()) )
                        .tickFormat(d3.format(".1f"))

  // Create map using d3.geoPath on converted topojson data
  svgMap.selectAll("path")
        .data(prefectureData)
        .enter()
        .append("path")
        .attr("d", geoGenerator)
        .attr("class", "prefecture")
        // Prefecture name used to match and obtain temperature data.
        .attr("fill", prefDataItem => {
          let id = prefDataItem.properties.NAME_1
          let pref = temperatureData.find(item => {
            return ( (item.year === currentYear) && (item.prefecture === id) )
          })
          let avTemperature = pref.value
          return dataScale(avTemperature)
        })

  // Add legend-axis
  svgMap.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${0.6 * w}, ${0.9 * h})`)
        .call(legendAxis)
        .selectAll("rect")
          .data(colors)
          .enter()
          .append("rect")
            .attr("width",  legendAxisLength / 9)
            .attr("height", 20)
            .attr("fill", d => d)
            .style("stroke", "none")
            .attr("transform", (d, i) => `translate(${legendAxisLength * i / 9}, -20)`)

  // Add slider for year
  svgMap.append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider)

}

// Import data - map data is converted from topojson format; temperature data imported after map data loaded
d3.json(japanMapDataUrl).then(
  (data, error) => {
    if(error) {
      console.log(error)
    } else {
      prefectureData = topojson.feature(data, data.objects.JPN_adm1).features
      // fix error in data "Naosaki" should be "Nagasaki" - below is temporary fix, issue raised on data repository 2021/10/07
      prefectureData[26].properties["NAME_1"] = "Nagasaki"
      // Once map data is obtained, fetch climate data
      d3.json(dataUrl).then(
        (data, error) => {
          if(error) {
            console.log(error)
          } else {
            let dataAll =data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
            temperatureData = dataAll.map(item => {
              return {
                    year: parseInt(item.VALUE["@time"].substring(0,4)),
                    prefecture: prefectures[parseInt(item.VALUE["@regionCode"].substring(0,2)) -1],
                    value: parseFloat(item.VALUE["$"])
              }
            })
            // set dateRange to range of dates of data, and set current displayed data to latest date's values
            yearRange = d3.extent(temperatureData, d => d.year)
            current = yearRange[1]
            // Once map data and climate data obtained, draw map
            drawMap()
            animateMap()
          }
        }
      )
    }
  }
)
