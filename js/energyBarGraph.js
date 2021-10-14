const wEnergy = 400
const hEnergy = 400
const marginEnergy = 40

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
                          .range([marginEnergy, wEnergy - marginEnergy])
                          .padding([0.2])

  const yScaleEnergy = d3.scaleLinear()
                          .domain([0, d3.max(totalOutputArr, d => d)])
                          .nice()
                          .range([hEnergy - marginEnergy, marginEnergy])

  // Add axes

  // X-axis
  svgEnergy.append("g")
            .attr("transform", `translate(0, ${hEnergy - marginEnergy})`)
            .call(d3.axisBottom(xScaleEnergy).tickSizeOuter(0))

  // y-axis
  svgEnergy.append("g")
            .attr("transform", `translate(${marginEnergy}, 0)`)
            .call(d3.axisLeft(yScaleEnergy))

  console.log(years)
  console.log(energyData)
  console.log(totalOutputArr)
  console.log(d3.max(totalOutputArr, d => d))

}

// --- Fetch Data ---
var energyData = []

const addEnergyData = () => {
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
      //TEMPORARY FIX - energyData reading as empty array on drawGraph function call
      setTimeout(function() {drawBarGraph()}, 1000)

}

addEnergyData()
