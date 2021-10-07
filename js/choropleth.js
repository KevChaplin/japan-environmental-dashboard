const w = 1000
const h = 700
const legendAxisLength = w/3

const japanMapDataUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/japan/jp-prefectures.json"

const dataBaseUrl = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"

let temperatureData = []
// Data: Average Air Temperature / Year / Prefecture
let indicatorId = "0102010000000010010"
let dataUrl = `${dataBaseUrl}&IndicatorCode=${indicatorId}`


// Colors for representing temperature differential (z-axis). Array of colors from d3-scale-chromatic. Color scale reversed to match data.
const colors = []
d3.schemeRdYlBu[9].forEach(color => colors.unshift(color))

const svgMap = d3.select("body")
                    .append("svg")
                    .attr("id", "map-canvas")
                    .attr("width", w)
                    .attr("height", h)
                    .style("fill", "green")
                    .style("stroke", "white")

const projection = d3.geoMercator()
                      .center([137.5,36])
                      .scale(2 * h)
                      .translate([w / 2, h / 2]);

const geoGenerator = d3.geoPath()
                    .projection(projection)

const drawMap = () => {
  let year = 1975

  // Colors representing temperature variance
  const dataScale = d3.scaleQuantile()
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

  // Creat map using d3.geoPath on converted topojson data
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
              return ( (item.year === year) && (item.prefecture === id) )
            })
            let avTemperature = pref.value
            return dataScale(avTemperature)
          })

    // legend-axis
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
}

// Import data - map data is converted from topojson format; temperature data imported after map data - see fetchData.js
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
            // Once map data and climate data obtained, draw map
            drawMap()
          }
        }
      )
    }
  }
)
