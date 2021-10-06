const baseUrl = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"

let temperatureData = []
// Data: Average Air Temperature / Year / Prefecture
let indicatorId = "0102010000000010010"
let dataUrl = `${baseUrl}&IndicatorCode=${indicatorId}`
console.log(dataUrl)

const getTemperatureData = () => {
    d3.json(dataUrl).then(
    (data, error) => {
      if(error) {
        console.log(error)
      } else {
        let dataAll =data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
        temperatureData = dataAll.map(item => {
          return {
                year: item.VALUE["@time"].substring(0,4),
                prefecture: prefectures[parseInt(item.VALUE["@regionCode"].substring(0,2)) -1],
                value: item.VALUE["$"]
          }
        })
        console.log(temperatureData)
        console.log(prefectures)
      }
    }
  )
}
