// const wClimate = 400
// const hClimate = 400
// const marginClimate = 40


// --- Fetch Data ---

var dataUrl
const dataBaseUrlEnergy = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"
// Data Indicator Ids as referenced on https://dashboard.e-stat.go.jp/en/static/api#skip_to_context
// Used to construct url for data retrieval from API.
// Each item is indicator id for listed power production (national):
const energyTypes = [ "Thermal", "Nuclear", "Geothermal", "Hydro", "Photovoltaic", "Wind" ]
const indicatorIdEnergyTypes = ["0901020000000010010", "0901020000000010020", "0901020000000010030", "0901020000000010040", "0901020000000010050", "0901020000000010060"]

var energyData = []

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
        dataAll.forEach(item => newObject.data.push([ parseInt(item.VALUE["@time"].substring(0,4)), item.VALUE["$"] ]) )
        energyData.push(newObject)
      }
    }
  )
}

console.log(energyData)
