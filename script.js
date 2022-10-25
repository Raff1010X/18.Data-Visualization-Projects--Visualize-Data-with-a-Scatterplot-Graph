fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
   .then((response) => response.json())
   .then((d) => {
   prepareData(d); 
 });

function prepareData(d) {
  const data = setData(d);
  drawData(data);
  window.addEventListener("resize", () => drawData(data), false);
}

function setData(d) {
  return d.map((el) => {
    let splited = el.Time.split(":");
    return [
      el.Year,
      new Date(1970, 0, 1, 0, splited[0], splited[1]),
      el.Name,
      el.Nationality,
      el.Doping,
      el.Time,
      Date.parse(el.Year)
    ];
  });
}

function drawData(data) {
  const chartDiv = document.getElementById("chart");
  chartDiv.textContent = "";
  const padding = 40;
  const chartWidth = chartDiv.offsetWidth - padding;
  const chartHeight = chartDiv.offsetHeight - padding;
  let rightSpace = 15;
  if (chartWidth <= 500) rightSpace = 10;

  const div = d3.select("#chart");
  div
    .append("h1")
    .attr("id", "title")
    .text("Doping in Professional Bicycle Racing")
    .append("h5")
    .attr("id", "subtitle")
    .text("35 Fastest times up Alpe d'Huez");

  div.append("div").attr("id", "tooltip");
  
  const toolTip = d3.select("#tooltip");
  toolTip.style("opacity", 0);

  const svg = d3.select("#chart").append("svg");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", padding + 15)
    .attr("x", -chartHeight / 2)
    .style("text-anchor", "middle")
    .style("font-size", "0.8rem")
    .text("Time in minutes");

  svg
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight - padding / 4)
    .style("text-anchor", "middle")
    .style("font-size", "0.8rem")
    .text("Year");

  const xScale = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => d[6]) - 2000 * 60 * 60 * 24 * 365,
      d3.max(data, (d) => d[6]) + 1000 * 60 * 60 * 24 * 365
    ])
    .range([padding, chartWidth - rightSpace]);
  
  const yScale = d3
    .scaleLinear()
    //.domain([new Date(1970, 0, 1, 0, 36, 40), new Date(1970, 0, 1, 0, 40, 0)])
    .domain([d3.min(data, (d) => new Date(d[1].getTime() - 10000)), d3.max(data, (d) => new Date(d[1].getTime() + 10000))])
    .range([chartHeight - padding, padding + 10]);

  const xAxis = d3.axisBottom().scale(xScale);
  // ticks every other year
  if (chartWidth <= 500)
    xAxis.tickFormat((el, i) => (i % 2 !== 0 ? "" : el.getFullYear()));
  
  svg
    .append("g")
    .attr("transform", "translate(0," + (chartHeight - padding) + ")")
    .call(xAxis)
    .attr("id", "x-axis");

  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

  svg
    .append("g")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis)
    .attr("id", "y-axis");

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 8)
    .attr("data-xvalue", (d, i) => data[i][0])
    .attr("data-yvalue", (d, i) => data[i][1])
    .attr("cx", (d, i) => xScale(data[i][6]))
    .attr("cy", (d) => yScale(d[1]))
    .attr("class", (d) => {
      if (d[4] !== "") return "dot dot-red";
      else return "dot dot-blue";
    })
    //.append("title")
    //.text((d, i) => d)
    .on("mouseover", (event, d) => {
      let i = data.indexOf(d);
      toolTip.html(
        data[i][2] +
          ", " +
          data[i][3] +
          "<br>" +
          "Year: " +
          data[i][0] +
          "<br>Time: " +
          data[i][5] +
          "<br>" +
          data[i][4]
      );
      let tooltipWidth = document.getElementById("tooltip").offsetWidth;
      let tooltipHeight = document.getElementById("tooltip").offsetHeight;
      toolTip
        .style("opacity", 1)
        .style("left", xScale(data[i][6]) - tooltipWidth / 2 + padding / 2 + "px")
        .style("top", yScale(d[1]) - tooltipHeight + padding / 2 + "px")
        .attr("data-year", data[i][0]);
    })
    .on("mouseout", (event, d) => toolTip.style("opacity", 0));

  const leftPos = chartWidth - 170;
  const rightPos = chartHeight - 4.5 * padding;

  const legend = svg.append("g").attr("id", "legend");

  legend
    .append("rect")
    .attr("x", leftPos)
    .attr("y", 35 + rightPos)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", "#03a9f4");

  legend
    .append("text")
    .attr("x", 25 + leftPos)
    .attr("y", 50 + rightPos)
    .text("- Riders with doping")
    .style("font-size", "0.7rem");

  legend
    .append("rect")
    .attr("x", leftPos)
    .attr("y", 75 + rightPos)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", "orange");

  legend
    .append("text")
    .attr("x", 25 + leftPos)
    .attr("y", 90 + rightPos)
    .text("- No doping")
    .style("font-size", "0.7rem");
}
