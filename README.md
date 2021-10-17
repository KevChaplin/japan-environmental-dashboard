# Japan Environmental Dashboard v1.0
### By Kevin Chaplin

## Project Goals
- Display relevant Japan centric data on issues related to climate change in an easy to understand and engaging format.

## Personal Goals
- Design and build my own project using the D3js framework to enhance my skills there.
- Simulate a real work environment by:
  - Using complex real-world REST API for data.
  - Completing the project within a deadline (online career fair on 2021/10/15 - project started on 2021/10/6, estimate of available work time: 40 hours)
    - Project complete by deadline. Total time: 44 hours.
    - However, app is not responsive do different screens sizes and overall design is basic. Will update for version 1.1
  - Using the Kanban work management system.-

## Design Choices
- Chose data that would be relevant to climate change and easy to understand.
- The intention is show trends over time as opposed to single data points.

## Known issues
- None

## If I had more time I would ... / Next steps
- App is not yet responsive, only set up for full-page/16:9
- I intended to do more work on style/design, but due to time constraints I went for a simple style. Will revisit this.
- Choropleth and climate line graph are using the same data sets. They currently use separate API fetch functions. However, I would like to combine into one API call and compare performance. ie. Several smaller API fetch vs one large API fetch.
- Bar graph data is loaded and sorted. Then data is sorted again into series data format as required by the stacked bar graph function. If possible, it would be better to sort the data only once, after retrieval.
- Would like to try the same project using React. Think it would be better to have separate components drawing on the data held within state variables. Didn't try with this run to limit my focus on learning more about D3.js.

## Resources
- Framework: D3js
- Kanban: trello.com
- Japan Statistics: Statistics Dashboard (Jpn Gov) https://dashboard.e-stat.go.jp/
  - This service uses the API feature of Statistics Dashboard, but the contents of this service are not guaranteed by the Statistics Bureau of Japan
- Japan Topojson data: https://github.com/deldersveld/topojson
- d3-simple-slider: https://github.com/johnwalley/d3-simple-slider
- Loading animation code courtesy of https://loading.io/css/

## Other Notes
- Error in Topojson data - Nagasaki prefecture's name listed as "Naosaki" - issue raised, error corrected within application.
