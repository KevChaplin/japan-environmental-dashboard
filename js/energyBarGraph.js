const wEnergy = 600
const hEnergy = 380
const marginEnergy = 40
const marginEnergyLeft = 80
const marginEnergyTop = 60
let loadingEnergy = false

// Append svg for bar graph
const svgEnergy = d3.select("#energy-bar-graph-plot")
                      .append("svg")
                        .attr("id", "svg-energy")
                        .attr("width", wEnergy)
                        .attr("height", hEnergy)

// List of energy sources, to be bar graph subgroups
const energyTypes = [ "Thermal", "Nuclear", "Geothermal", "Hydro", "Photovoltaic", "Wind" ]

// --- Draw line graph ---

const drawBarGraph = () => {
  // List of years, to be used as groups for bar graph
  let years = energyData[0].data.map(item => item[0])

  // Set scales

  // To find max of Y need to check total power output of all power sources for each year
  let totalOutputArr = []
  for (let i = 0; i < years.length; i++) {
    let outputArr = energyData.map(d => d.data[i][1])
    let totalOutput = outputArr.reduce((total, num) => total + num)
    totalOutputArr.push(totalOutput)
    }

  const xScaleEnergy = d3.scaleBand()
                          .domain(years)
                          .range([marginEnergyLeft, wEnergy - marginEnergy])
                          .padding([0.2])

  const yScaleEnergy = d3.scaleLinear()
                          .domain([0, d3.max(totalOutputArr, d => d)])
                          .nice()
                          .range([hEnergy - marginEnergy, marginEnergyTop])

  // Add axes

  // X-axis
  svgEnergy.append("g")
            .attr("transform", `translate(0, ${hEnergy - marginEnergy})`)
            .call(d3.axisBottom(xScaleEnergy).tickSizeOuter(0))

  // y-axis
  svgEnergy.append("g")
            .attr("transform", `translate(${marginEnergyLeft}, 0)`)
            .call(d3.axisLeft(yScaleEnergy))

  // Color palette for energy type
  const colorArrEnergy = ["#6929c4","#9f1853","#198038","#b28600","#8a3800","#1192e8"]

  const colorEnergy = d3.scaleOrdinal()
                        .domain(energyTypes)
                        .range(colorArrEnergy)

  // Stack the data per energy type
  // Data format is required to be in series i.e. [{year: xx, Thermal: xx, Nuclear: xx, Geothermal: xx, ...}, {}, ...]
  // Convert data

  let seriesData = []
  const getVal = (typeStr, year) =>  energyData.find(d => d.energyType === typeStr).data.find(x => x[0] === year)[1]
  years.forEach(year => seriesData.push(
    {
    year: year,
    Thermal: getVal("Thermal",year),
    Nuclear: getVal("Nuclear",year),
    Geothermal: getVal("Geothermal",year),
    Hydro: getVal("Hydro",year),
    Photovoltaic: getVal("Photovoltaic",year),
    Wind: getVal("Wind",year)
    }
  ))

  const stackedData = d3.stack()
                        .keys(energyTypes)

  const series = stackedData(seriesData)

  // Add the bars
  svgEnergy.append("g")
            .selectAll("g")
            // Enter in the series data = loop key per key = group per group
            .data(series)
            .join("g")
              .attr("fill", d => colorEnergy(d.key))
              .selectAll("rect")
              // enter a second time = loop subgroup per subgroup to add all rectangles
              .data(d => d)
              .join("rect")
                .attr("x", d => xScaleEnergy(d.data.year))
                .attr("y", d => yScaleEnergy(d[1]))
                .attr("height", d => yScaleEnergy(d[0]) - yScaleEnergy(d[1]))
                .attr("width",xScaleEnergy.bandwidth())

  // Add legend
  const legendEnergy = svgEnergy.append("g")
                                .attr("id", "legend-energy")
                                .attr("transform", "translate(0, 30)")

  const legendItemsEnergy = legendEnergy.selectAll("g")
                                        .data(energyTypes)
                                        .enter()
                                        .append("g")
                                        .attr("transform", (type, i) => `translate(${(i*wEnergy/6) + (wEnergy/6/2)}, 0)`)

  // Square icon for legend
  legendItemsEnergy.append("rect")
                    .attr("class", "legend-energy-item")
                    .attr("fill", (type, i) => colorArrEnergy[i])
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("transform", "translate(-5, -25)")

  // Labels for legend
  legendItemsEnergy.append("text")
                    .text(type => type)
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate(0, 5)")

}

// --- Fetch Data ---
var energyData = []

const addEnergyData = () => {
  // Show loading animation
  d3.select(".bar-loading").style("visibility", "visible")
  const dataBaseUrlEnergy = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"
  // Data Indicator Ids as referenced on https://dashboard.e-stat.go.jp/en/static/api#skip_to_context
  // Used to construct url for data retrieval from API.
  // Each item is indicator id for corresponding power source - see energyTypes
  const indicatorIdEnergyTypes = ["0901020000000010010", "0901020000000010020", "0901020000000010030", "0901020000000010040", "0901020000000010050", "0901020000000010060"]
  const energyUrls = []
  indicatorIdEnergyTypes.forEach(item => energyUrls.push(`${dataBaseUrlClimate}&IndicatorCode=${item}`))
  var promises = []

  // Create array of promises (fetch requests - d3.json())).
  energyUrls.forEach( url => promises.push(d3.json(url)) )
  // Use promiseAll to give result once all promises(fetch requests) are fulfilled.
  Promise.all(promises)
    // Once all fetch requests completed, create dataset for each fetch
    .then(
      values => values.forEach(result => {
        let dataAll = result.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
        // For each dataset (return of fetch request), create an object with energy type, and array of [year, value] data points.
        let newObject = {
                    energyType: "",
                    data: []
                    }
        // check indicator Id to add energy source to opbject (energyType)
        let indicator = dataAll[0].VALUE["@indicator"]
        newObject.energyType = energyTypes[indicatorIdEnergyTypes.indexOf(indicator)]
        // Iterate over dataset to give year, value data pairs
        dataAll.forEach(item => {
          let year = parseInt(item.VALUE["@time"].substring(0,4))
          let value = parseInt(item.VALUE["$"])
          newObject.data.push([ year, value ])
          })
        energyData.push(newObject)
      }))
    .then(newResult => {
      // Hide loading animation
      d3.select(".bar-loading").style("visibility", "hidden")
      drawBarGraph()
      })
}

addEnergyData()
