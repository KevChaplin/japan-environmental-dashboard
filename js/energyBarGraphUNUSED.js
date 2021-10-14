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

// List of years, to be used as groups for bar graph
var years = []

// --- Draw line graph ---

const drawBarGraph = () => {

  // Set scales
  const xScaleEnergy = d3.scaleBand()
                          .domain(years)
                          .range([marginEnergy, wEnergy - marginEnergy])
                          .padding([0.2])

  const yScaleEnergy = d3.scaleLinear()
                          .domain(d3.extent(energyData, d => d.data[1]))
                          .nice()
                          .range([hEnergy - marginEnergy, marginEnergy])

console.log(years)
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x).tickSizeOuter(0));

}



// --- Fetch Data ---

var dataUrl
const dataBaseUrlEnergy = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"
// Data Indicator Ids as referenced on https://dashboard.e-stat.go.jp/en/static/api#skip_to_context
// Used to construct url for data retrieval from API.
// Each item is indicator id for corresponding power source - see energyTypes
const indicatorIdEnergyTypes = ["0901020000000010010", "0901020000000010020", "0901020000000010030", "0901020000000010040", "0901020000000010050", "0901020000000010060"]

var energyData = []

const addEnergyData = () => {
  // Loop over all indicator Ids to obtain all data in one dataset - array of objects containing one energy source type and array of all year - energy production pair values.
  for (let i=0; i < energyTypes.length; i++) {
    // Fetch energy production data function
    dataUrl = `${dataBaseUrlClimate}&IndicatorCode=${indicatorIdEnergyTypes[i]}`
    d3.json(dataUrl).then(
      (data, error) => {
        if(error) {
          console.log(error)
        } else {
          let dataAll = data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
          let newObject = {
            energyType: energyTypes[i],
            data: []
            }
          // For each set of data, create an object with energy type, and array of [year, value] data points.
          // Also update array of years (included here due to asynchronous data fetch)
          dataAll.forEach(item => {
            let year = parseInt(item.VALUE["@time"].substring(0,4))
            let value = item.VALUE["$"]
            newObject.data.push([ year, value ])
            if(!years.includes(year)) { years.push(year)}
          })
          energyData.push(newObject)
        }
      }
    )
  }
  drawBarGraph()
  console.log(energyData)
}

addEnergyData()
