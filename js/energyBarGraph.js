// --- Fetch Data ---

var dataUrl
const dataBaseUrlEnergy = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"
// Data Indicator Ids as referenced on https://dashboard.e-stat.go.jp/en/static/api#skip_to_context
// Used to construct url for data retrieval from API.
// Each item is indicator id for listed power production (national):
const energyTypes = [ "Thermal", "Nuclear", "Geothermal", "Hydro", "Photovoltaic", "Wind" ]
const indicatorIdEnergyTypes = ["0901020000000010010", "0901020000000010020", "0901020000000010030", "0901020000000010040", "0901020000000010050", "0901020000000010060"]

var energyData = []

// Fetch energy production data function - API request from all indicatorId simultaneously
dataUrl = `${dataBaseUrlClimate}&IndicatorCode=${indicatorIdEnergyTypes[0]}`
console.log(dataUrl)

d3.json(dataUrl).then(
  (data, error) => {
    if(error) {
      console.log(error)
    } else {
      let dataAll =data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
      console.log(dataAll)
      let newObject = {
        energyType: energyTypes[0],
        data: []
        }
      // For each set of data, create an object with energy type, and array of [year, value] data points.
      dataAll.forEach(item => newObject.data.push([ parseInt(item.VALUE["@time"].substring(0,4)), item.VALUE["$"] ]) )
      energyData.push(newObject)
    }
  }
)

//
// let newObject = {
//   year: "",
//   thermal: "",
//   nuclear: "",
//   geothermal: "",
//   hydro: "",
//   photovoltaic: "",
//   wind: ""
//   }
