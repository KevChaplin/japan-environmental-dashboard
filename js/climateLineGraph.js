const wClimate = 400
const hClimate = 400
const marginClimate = 30

// Append svg for line graph
const svgClimate = d3.select("#climate-line-graph-plot")
                      .append("svg")
                        .attr("width", wClimate)
                        .attr("height", hClimate)

// --- Draw line graph ---

const drawLineGraph = () => {

  // Set scales
  const xScaleClimate = d3.scaleLinear()
                          .domain(d3.extent(climateDataNat, d => d.year))
                          .range([marginClimate, wClimate - marginClimate])

  const yScaleClimate = d3.scaleLinear()
                          .domain(d3.extent(climateDataNat, d => d.average))
                          .nice()
                          .range([hClimate - marginClimate, marginClimate])

  const xAxisClimate = d3.axisBottom()
                          .scale(xScaleClimate)
                          .tickFormat(d3.format("d"))

  const yAxisClimate = d3.axisLeft()
                          .scale(yScaleClimate)

    svgClimate.append("path")
              .datum(climateDataNat)
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 1.5)
              .attr("d", d3.line()
                .x(function(d) { return xScaleClimate(d.year) })
                .y(function(d) { return yScaleClimate(d.average) })
                )

  // const line = d3.line()
  //                 .x(function(d) { return xScaleClimate(d.year) })
  //                 .y(function(d) { return yScaleClimate(d.average) })
  //
  // const lines = svgClimate.selectAll("lines")
  //                         .data(climateDataNat)
  //                         .enter()
  //                         .append("g")
  //
  // lines.append("path")
  //       .attr("d", function(d) {return line(d)})

  // Create x-axis
  svgClimate.append("g")
            .attr("transform", `translate(0, ${hClimate - marginClimate})`)
            .call(xAxisClimate);

  // Create y-axis
  svgClimate.append("g")
            .attr("transform", `translate(${marginClimate}, 0)`)
            // .attr("transform", `translate(${marginClimate}, ${hClimate - marginClimate})`)
            .call(yAxisClimate);

  }

// --- Fetch Data ---

// Need data for all Japan. Data is prefectural, already obtained under choropleth.js - climateDataPref
var dataUrl
const dataBaseUrlClimate = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"

// Data Indicator Ids as referenced on https://dashboard.e-stat.go.jp/en/static/api#skip_to_context
// Used to construct url for data retrieval from API - data initialized to Average Air Temperature
// Array:
  // [ Average Air Temperature / Year / Prefecture,
  // Highest Monthly Average Air Temperature / Year / Prefecture,
  // Lowest Monthly Average Air Temperature / Year / Prefecture,
  // Yearly precipitation / Prefecture ]
const indicatorIdArrClimate = ["0102010000000010010", "0102010000000010020", "0102010000000010030", "0102020300000010010"]
var indicatorIdClimate = indicatorIdArr[0]

var climateDataNat = []

// Fetch climate data (prefectural) function

dataUrl = `${dataBaseUrlClimate}&IndicatorCode=${indicatorIdClimate}`
d3.json(dataUrl).then(
  (data, error) => {
    if(error) {
      console.log(error)
    } else {

      // Loop through data to extract yearly array of data values to be used to calculate averages.
      let dataAll =data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ

      // Loop ththough fetched data
      for (let i= 0, j=0; i < dataAll.length; i++) {
        let newObject = {
            year: "",
            data: [],
            average: ""
          }
        // If dataset "climateDataNat" is empty, set year and add data to data array. j = current index of climateDataNat array.
        if (climateDataNat.length === 0) {
          newObject.year = dataAll[i].VALUE["@time"]
          newObject.data.push(parseFloat(dataAll[i].VALUE["$"]))
          climateDataNat.push(newObject)
        }
        // Else if year is same for climateDataNat and dataAll item, add items data value to climateDataNat data
        else if (dataAll[i].VALUE["@time"] === climateDataNat[j].year) {
          climateDataNat[j].data.push(parseFloat(dataAll[i].VALUE["$"]))
        }
        // Else (climateDataNat is not empty and year is different), calculate average, add new object with the new year, add value from dataAll item to new object, increment j
        else {
          newObject.year = dataAll[i].VALUE["@time"]
          newObject.data.push(parseFloat(dataAll[i].VALUE["$"]))
          climateDataNat.push(newObject)
          j++
        }
      }
      // Calculate and add the averages for each year to give a national figure, convert year string into number "YYYY"
      climateDataNat.forEach(item => {
        item.average = item.data.filter(x => x).reduce((total, num) => total + num ) / item.data.filter(x => x).length
        item.year = parseInt(item.year.substring(0,4))
      })
      console.log(climateDataNat)
      // ONce data has been obtained
      drawLineGraph()
    }
  }
)