let table;
let topCountries;
let countryColors = {};
let tooltipVisible = false;
let tooltipContent = {};
let tooltip;
let legend;
let legendX2 = 65;
let legendY2;
let tooltipX;


function preload() {
  table = loadTable("https://docs.google.com/spreadsheets/d/e/2PACX-1vQvlUjfgvCvViHIxuAg3HgDPv0a7QxBe8mHjZgfRm9T0SbN8EK1T6AqZBlcirzvSmRZk1XwTIDW4a8P/pub?gid=115474862&single=true&output=csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight * 1.5);
  textAlign(CENTER);
  let margin = 50;


  let colors = [
    color(0, 0, 255),     // 
    color(252, 214, 143),   // 
    color(0, 204, 150),   // 
    color(132, 112, 255), // 
    color(255, 69, 0),    //  
    color(0, 255, 255),   // 
    color(255, 166, 0), // 
    color(182, 232, 128), //  
    color(255, 0, 255),   // 
    color(173, 216, 230)  // 
  ];


  // Set axes ranges
  let xMin = 0;
  let xMax = 100;
  let yMin = 0;
  let yMax = 100;

  // Calculate plot dimensions
  plotWidth = width - 2 * margin;
  plotHeight = windowHeight  - 2 * margin;




  // Store plot top-left position
  plotX = margin;
  plotY = margin;

  // Calculate legend dimensions
  let legendX = plotX + plotWidth + 30;
  let legendY = plotY;
  let legendSpacing = 20;


  // Draw left border (same as y-axis)
  stroke(0);
  line(plotX, plotY, plotX, plotY + plotHeight);

  // Draw bottom border (same as x-axis)
  line(plotX, plotY + plotHeight, plotX + plotWidth, plotY + plotHeight);

  // Draw right border
  let rightBorderX = plotX + plotWidth;
  line(rightBorderX, plotY, rightBorderX, plotY + plotHeight);

  // Draw top border
  line(plotX, plotY, rightBorderX, plotY);


  // Draw axes
  let numTicks = 6;
  let tickSpacing = plotWidth / (numTicks - 1);

  // X-axis ticks and labels
  for (let i = 0; i < numTicks; i++) {
    let x = plotX + i * tickSpacing;
    line(x, plotY + plotHeight, x, plotY + plotHeight + 5); // Tick lines
    textAlign(CENTER, TOP);
    text(i * 20, x, plotY + plotHeight + 10); // Tick labels
  }

  // Y-axis ticks and labels
  tickSpacing = plotHeight / (numTicks - 1);
  for (let i = 0; i < numTicks; i++) {
    let y = plotY + i * tickSpacing;
    line(plotX - 5, y, plotX, y); // Tick lines
    textAlign(RIGHT, CENTER);
    text((5 - i) * 20, plotX - 10, y); // Tick labels
  }

  // Draw title()
  fill(0);
  textAlign(CENTER);
  textSize(18);
  text("Top 10 Countries' Cities Environmental Quality", width / 2, plotY - 26);

  // Draw x-axis label
  textAlign(CENTER, TOP);
  text("Water Quality", plotX + plotWidth / 2, plotY + plotHeight + 26);

  // Draw y-axis label
  push(); // Save state
  translate(10, plotY + plotHeight / 2);
  rotate(-PI / 2);
  text("Air Quality", 0, 0);
  pop(); // Restore state

  // Get top 10 countries by data point count
  let countryCounts = {};
  for (let row of table.rows) {
    let country = row.getString('Country');
    if (!countryCounts[country]) {
      countryCounts[country] = 0;
    }
    countryCounts[country]++;
  }

  topCountries = Object.keys(countryCounts)
    .sort((a, b) => countryCounts[b] - countryCounts[a])
    .slice(0, 10);


  // Assign colors to countries
  for (let i = 0; i < topCountries.length; i++) {
    let country = topCountries[i];
    countryColors[country] = colors[i % colors.length];
  }

  legendY2 = plotY + plotHeight + 77;


  // Draw data points
  for (let row of table.rows) {
    let country = row.getString('Country');
    if (topCountries.includes(country)) {
      let x = map(row.getNum('WaterQuality'), 0, 100, plotX, plotX + plotWidth);
      let y = map(row.getNum('AirQuality'), 0, 100, plotY + plotHeight, plotY);
      noStroke();
      fill(countryColors[country]);
      ellipse(x, y, 8, 8);
    }
  }



  //Add Tooltip
  tooltip = createDiv('');
  tooltip.position(10, 10);
  tooltip.hide();
  tooltip.style('background-color', 'white');
  tooltip.style('padding', '10px');
  tooltip.style('border', '1px solid black');
  tooltip.style('line-height', '1.5');


  let tooltipFont = textFont();
  let tooltipFontSize = 12;
  tooltip.style('font-family', tooltipFont);
  tooltip.style('font-size', `${tooltipFontSize}px`);


  // Create legend with checkboxes for each country
  legend = createLegend();
}

function createLegend() {
  let legendItems = [];
  // Calculate legend dimensions
  //  let legendX = plotX + plotWidth + 30;
  //  let legendY = plotY;
  //  let legendSpacing = 20;

  legendX2;
  legendY2;
  let legendSpacing = 20;

  for (let i = 0; i < topCountries.length; i++) {
    let country = topCountries[i];
    let x = legendX2;
    let y = legendY2 + i * legendSpacing;

    let checkbox = createCheckbox(country, true);
    checkbox.position(x, y);
    checkbox.changed(toggleCountryVisibility);
    checkbox.style('font-size', '12px'); // Set font size
    checkbox.style('font-family', 'sans-serif'); // Set font family
    checkbox.style('color', 'black'); // Set text color


    fill(countryColors[topCountries[i]]);
    ellipse(x - 10, y + 11, 10, 10);
    fill(0);


    legendItems.push({ country, checkbox });
  }

  return legendItems;
}

function toggleCountryVisibility() {
  clear(); // Clear and redraw the canvas

  for (let item of legend) {
    let country = item.country;
    let visible = item.checkbox.checked();

    for (let row of table.rows) {
      if (row.getString('Country') === country) {
        let x = map(row.getNum('WaterQuality'), 0, 100, plotX, plotX + plotWidth);
        let y = map(row.getNum('AirQuality'), 0, 100, plotY + plotHeight, plotY);

        if (visible) {
          fill(countryColors[country]);
          ellipse(x, y, 8, 8);
        } else {
          //fill(255); // Change to background color
          //ellipse(x, y, 8, 8);
        }
      }
    }
  }



}






function draw() {
  let hovered = false;

  //  // Calculate legend dimensions
  //  let legendX = plotX + plotWidth + 30;
  //  let legendY = plotY;
  //  let legendSpacing = 20;

  //   // Draw legend
  //   fill(0);
  //   textSize(12);
  //   textAlign(LEFT);

  //   for (let i = 0; i < topCountries.length; i++) {
  //     let country = topCountries[i];
  //     let x = legendX;
  //     let y = legendY + i * legendSpacing;
  //     fill(countryColors[topCountries[i]]);
  //     ellipse(x, y + 5, 10, 10);
  //     fill(0);
  //     text(country, x + 15, y);
  //   }

  legendX2;
  legendY2;
  let legendSpacing = 20;

  for (let i = 0; i < topCountries.length; i++) {
    let country = topCountries[i];
    let x = legendX2;
    let y = legendY2 + i * legendSpacing;


    fill(countryColors[topCountries[i]]);
    ellipse(x - 10, y + 11, 10, 10);
    fill(0);
  }


  for (let item of legend) {
    let country = item.country;
    let visible = item.checkbox.checked();

    for (let row of table.rows) {
      if (row.getString('Country') === country && visible) {
        let x = map(row.getNum('WaterQuality'), 0, 100, plotX, plotX + plotWidth);
        let y = map(row.getNum('AirQuality'), 0, 100, plotY + plotHeight, plotY);
        let d = dist(mouseX, mouseY, x, y);

        // Calculate tooltip position
        let tooltipX;
        if (x < width / 2) {
          // Left side  
          tooltipX = x + 10;
        }
        else {
          // Right side  
          tooltipX = mouseX - 100;
        }

        let tooltipY = mouseY + 10;


        if (d < 8) {
          hovered = true;

          tooltip.position(tooltipX, tooltipY);



          tooltip.html(`
            City: ${row.getString('City')}<br>
            Region: ${row.getString('Region').replace(/"/g, '')}<br>
            Country: ${row.getString('Country').replace(/"/g, '')}<br>
            Air Quality: ${row.getNum('AirQuality')}<br>
            Water Quality: ${row.getNum('WaterQuality')}
          `);
          tooltip.show();
          tooltip.position(tooltipX, tooltipY);
          break;
        }
      }
    }
  }

  if (!hovered) {
    tooltip.hide();
  }

  textAlign(CENTER, BOTTOM); // Center text horizontally, align to the bottom
  textSize(14); // Set the text size
  fill(150); // Set the text color to black
  let textContent = "by Keira H";
  let linesFromBottom = 3; // Adjust this value to set the distance from the bottom
  text(textContent, width / 2, height - linesFromBottom * textSize()); // Display the text
  text.style('font-family', tooltipFont);

}

