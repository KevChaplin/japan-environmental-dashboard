const baseUrl = "https://dashboard.e-stat.go.jp/api/1.0/Json/getData?"

// Data: .......
let indicatorId = "0101010200000010020"
let dataUrl = `${baseUrl}&IndicatorCode=${indicatorId}`
console.log(dataUrl)

const w = 1500
const h = 800

d3.json(dataUrl).then(
  (data, error) => {
    if(error) {
      console.log(error)
    } else {
      console.log(data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ)
    }
  }
)
