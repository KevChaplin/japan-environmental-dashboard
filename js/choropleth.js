const w = 1000
const h= 700

const japanMapDataUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/japan/jp-prefectures.json"

let prefectureData

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

  svgMap.selectAll("path")
          .data(prefectureData)
          .enter()
          .append("path")
          .attr("d", geoGenerator)
          .attr("class", "prefecture")
}

d3.json(japanMapDataUrl).then(
  (data, error) => {
    if(error) {
      console.log(error)
    } else {
      prefectureData = topojson.feature(data, data.objects.JPN_adm1).features
      drawMap()
    }
  }
)
