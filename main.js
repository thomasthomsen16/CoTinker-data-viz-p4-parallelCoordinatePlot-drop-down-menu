document.addEventListener("DOMContentLoaded", function () {
    fetch('https://raw.githubusercontent.com/thomasthomsen16/dataset-p2/refs/heads/main/30000_spotify_songs.csv')
        .then(response => response.text())
        .then(csvData => {
            const parsedData = parseCSV(csvData);
            const sampleData = getRandomSample(parsedData, 100);
            renderChart(sampleData, "chart1");
        })
        .catch(error => console.error("Error loading CSV data: ", error));
});

function renderChart(sampleData, chartId) {
    const chartContainer = document.getElementById(chartId);
    chartContainer.innerHTML = ""; // Clear existing content

    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Parallel coordinates plot for Spotify songs with selectable axes via dropdowns.",
        "data": {
          "values": sampleData
        },
        "width": 800,
        "height": 500,
        "params": [
          {
            "name": "axis1",
            "value": "tempo",
            "bind": { "input": "select", "options": ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness", "duration_ms", "liveness"] }
          },
          {
            "name": "axis2",
            "value": "danceability",
            "bind": { "input": "select", "options": ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness", "duration_ms", "liveness"] }
          },
          {
            "name": "axis3",
            "value": "energy",
            "bind": { "input": "select", "options": ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness" , "duration_ms", "liveness"] }
          },
          {
            "name": "axis4",
            "value": "valence",
            "bind": { "input": "select", "options": ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness", "duration_ms", "liveness"] }
          }
        ],
        "transform": [
          {
            "filter": "datum[axis1] != null && datum[axis2] != null && datum[axis3] != null && datum[axis4] != null"
          },
          {
            "window": [{ "op": "count", "as": "index" }]
          },
          {
            "fold": ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness", "duration_ms", "liveness"],
            "as": ["key", "value"]
          },
          {
            "filter": "datum.key === axis1 || datum.key === axis2 || datum.key === axis3 || datum.key === axis4"
          },
          {
            "joinaggregate": [
              { "op": "min", "field": "value", "as": "min" },
              { "op": "max", "field": "value", "as": "max" }
            ],
            "groupby": ["key"]
          },
          {
            "calculate": "datum.max === datum.min ? 0 : (datum.value - datum.min) / (datum.max - datum.min)",
            "as": "norm_val"
          },
          {
            "calculate": "(datum.min + datum.max) / 2",
            "as": "mid"
          }
        ],
        "layer": [
          {
            "mark": { "type": "rule", "color": "#ccc" },
            "encoding": {
              "detail": { "aggregate": "count" },
              "x": {
                "type": "nominal",
                "field": "key",
                "sort": [
                  { "signal": "axis1" },
                  { "signal": "axis2" },
                  { "signal": "axis3" },
                  { "signal": "axis4" }
                ]
              }
            }
          },
          {
            "mark": "line",
            "encoding": {
              "color": { "type": "nominal", "field": "playlist_genre" },
              "detail": { "type": "nominal", "field": "index" },
              "x": {
                "type": "nominal",
                "field": "key",
                "sort": [
                  { "signal": "axis1" },
                  { "signal": "axis2" },
                  { "signal": "axis3" },
                  { "signal": "axis4" }
                ]
              },
              "y": {
                "type": "quantitative",
                "field": "norm_val",
                "axis": null
              },
            //   "tooltip": [
            //     { "type": "quantitative", "field": "axis1" },
            //     { "type": "quantitative", "field": "axis2" },
            //     { "type": "quantitative", "field": "axis3" },
            //     { "type": "quantitative", "field": "axis4" }
            //   ]
            }
          },
          {
            "encoding": {
              "x": {
                "type": "nominal",
                "field": "key",
                "sort": [
                  { "signal": "axis1" },
                  { "signal": "axis2" },
                  { "signal": "axis3" },
                  { "signal": "axis4" }
                ]
              },
              "y": { "value": 0 }
            },
            "layer": [
              {
                "mark": { "type": "text", "style": "label" },
                "encoding": {
                  "text": { "aggregate": "max", "field": "max" }
                }
              },
              {
                "mark": { "type": "tick", "style": "tick", "size": 8, "color": "#ccc" }
              }
            ]
          },
          {
            "encoding": {
              "x": {
                "type": "nominal",
                "field": "key",
                "sort": [
                  { "signal": "axis1" },
                  { "signal": "axis2" },
                  { "signal": "axis3" },
                  { "signal": "axis4" }
                ]
              },
              "y": { "value": 150 }
            },
            "layer": [
              {
                "mark": { "type": "text", "style": "label" },
                "encoding": {
                  "text": { "aggregate": "min", "field": "mid" }
                }
              },
              {
                "mark": { "type": "tick", "style": "tick", "size": 8, "color": "#ccc" }
              }
            ]
          },
          {
            "encoding": {
              "x": {
                "type": "nominal",
                "field": "key",
                "sort": [
                  { "signal": "axis1" },
                  { "signal": "axis2" },
                  { "signal": "axis3" },
                  { "signal": "axis4" }
                ]
              },
              "y": { "value": 300 }
            },
            "layer": [
              {
                "mark": { "type": "text", "style": "label" },
                "encoding": {
                  "text": { "aggregate": "min", "field": "min" }
                }
              },
              {
                "mark": { "type": "tick", "style": "tick", "size": 8, "color": "#ccc" }
              }
            ]
          }
        ],
        "config": {
          "axisX": { "domain": false, "labelAngle": 0, "tickColor": "#ccc", "title": null },
          "view": { "stroke": null },
          "style": {
            "label": { "baseline": "middle", "align": "right", "dx": -5 },
            "tick": { "orient": "horizontal" }
          }
        }
      };

    vegaEmbed(`#${chartId}`, spec);
}

// Function to parse CSV data into an array of objects
function parseCSV(csvData) {
    const rows = csvData.split("\n").filter(row => row.trim() !== "");
    const header = rows[0].split(",").map(column => column.trim());

    return rows.slice(1).map(row => {
        const values = row.split(",");

        if (values.length !== header.length) {
            return null;
        }

        let parsedRow = {};
        header.forEach((column, index) => {
            let value = values[index].trim();
            parsedRow[column] = isNaN(value) ? value : parseFloat(value);
        });

        return parsedRow;
    }).filter(row => row !== null);
}

function getRandomSample(data, sampleSize) {
    const requiredFields = ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness", "duration_ms", "liveness"];
    const validData = data.filter(row => requiredFields.every(field => row[field] !== null));

    if (validData.length <= sampleSize) {
        return validData;
    }

    return validData.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
}
