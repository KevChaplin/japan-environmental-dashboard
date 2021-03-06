const marginClimate = 40
const marginClimateLeft = 80

var yearRangeClimate = [1975,2019]

// Set title for map based on selected data
var climateTitle
const climateTitles = [
  "Average temperature \
  - nationwide(°C)",
  "Highest temperature of monthly averages of daily highs - nationwide average (°C)",
  "Lowest temperature among monthly averages of daily lows - nationwide average (°C)",
  "Yearly Precipitation - nationwide average (mm)"
]

const updateClimateTitle = () => {
  let climateTitlesIndex = document.getElementById("select-data-climate").selectedIndex
  climateTitle = `${climateTitles[climateTitlesIndex]} ${yearRange[0]} - ${yearRange[1]}`
  d3.select("#climate-title").text(`${climateTitle}`)
}

// Append svg for line graph - function so it can be called after removing svg for resizing/updating
const addClimateSvg = () => {
  svgClimate = d3.select("#climate-line-graph-plot")
                        .append("svg")
                          .attr("id", "svg-climate")
                          .attr("width", width)
                          .attr("height", height)
}

// Function to change data source and fetch new data.
const changeDataClimate = () => {
  let indicatorIndexClimate = document.getElementById("select-data-climate").selectedIndex
  indicatorIdClimate = indicatorIdArrClimate[indicatorIndexClimate]
  d3.select("#svg-climate").remove()
  climateDataNat = []
  addClimateSvg()
  addClimateData()
  updateClimateTitle()
}

// Redraw function - include re-appending plot svg
const reDrawClimate = () => {
  addClimateSvg()
  drawLineGraph()
}

// --- Draw line graph ---
const drawLineGraph = () => {

  // Set scales
  const xScaleClimate = d3.scaleLinear()
                          .domain(d3.extent(climateDataNat, d => d.year))
                          .range([marginClimateLeft, width - marginClimate])

  const yScaleClimate = d3.scaleLinear()
                          .domain(d3.extent(climateDataNat, d => d.average))
                          .nice()
                          .range([height - marginClimate, marginClimate])

  // Set axes
  const xAxisClimate = d3.axisBottom()
                          .scale(xScaleClimate)
                          .tickFormat(d3.format("d"))

  const yAxisClimate = d3.axisLeft()
                          .scale(yScaleClimate)

  // Create line for line-graph
  svgClimate.append("path")
            .attr("class", "line")
            .datum(climateDataNat)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
              .x(function(d) { return xScaleClimate(d.year) })
              .y(function(d) { return yScaleClimate(d.average) })
              )

  // Create x-axis
  svgClimate.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height - marginClimate})`)
            .call(xAxisClimate);

  // Create y-axis
  svgClimate.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${marginClimateLeft}, 0)`)
            .call(yAxisClimate)

  // div is initially hidden, visble after svg created to prevent "pop-in"
  d3.select("#climate-line-graph").style("visibility", "visible")
}

// --- Fetch Data ---

// Need data for all Japan. Data is prefectural.
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
const addClimateData = () => {
  // Show loading animation
  d3.select(".line-loading").style("visibility", "visible")
  // Create Url
  dataUrl = `${dataBaseUrlClimate}&IndicatorCode=${indicatorIdClimate}`
  d3.json(dataUrl).then(
    (data, error) => {
      if(error) {
        console.log(error)
      } else {
        let dataAll =data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
        // Loop through data to extract array of data values (per prefecture) to be used to calculate average (i.e national).
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
          // Else if year is same for climateDataNat and dataAll items, add items data value to climateDataNat data
          else if (dataAll[i].VALUE["@time"] === climateDataNat[j].year) {
            climateDataNat[j].data.push(parseFloat(dataAll[i].VALUE["$"]))
          }
          // Else (climateDataNat is not empty and year is different), add new object with the new year, add value from dataAll item to new object, increment j
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
        yearRangeClimate = d3.extent(climateDataNat, d => d.year)
        // Once data has been obtained
        // Hide loading animation
        d3.select(".line-loading").style("visibility", "hidden")
        drawLineGraph()
      }
    }
  )
}

// On initial load, add svg, run addClimtateData function (which adds data and draws graph)
addClimateSvg()
addClimateData()
