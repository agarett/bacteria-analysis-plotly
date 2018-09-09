function buildMetadata(sample) {

  //access the metadata by sample 
  var url = `/metadata/${sample}`;

  // Use `d3.json` to fetch the metadata for a sample
  metaData = d3.json(url).then(data=> {
  
    console.log(data)

    //clear any existing metadata
    d3.select('#sample-metadata').html("");

    //select the input from the metadata
    var inputValue = d3.select('#sample-metadata');

    //iterate over the data to get all the records in an object
    var metaObject = Object.entries(data);
    console.log(metaObject);

    //append the selected data to the sample-metadata area
    metaObject.forEach((selection) => {
      var row = inputValue.append("tr");
      Object.entries(selection).forEach(([key, value]) => {
        var cell = inputValue.append("td");
        cell.text(value);
      });
    });
    // BONUS: Build the Gauge Chart 
    buildGauge(data.WFREQ);
    
  });
   
}
  
function buildCharts(sample) {

  //Fetch the sample data for the plots
  var url = `/samples/${sample}`;
  var metaData = d3.json(url).then(data => {
    console.log(data, "test data");

    //select pie chart id, clear current data 
    d3.select('#pie').html("");
    var pieInput = d3.select('#pie');

    //use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var sampleSlice = (data.sample_values).slice(0,10);
    var otuIds = (data.otu_ids).slice(0,10);
    var otuLabels = (data.otu_labels).slice(0,10);
    console.log(sampleSlice);
    console.log(otuIds);
    console.log(otuLabels);

    //build Pie chart
    var pieData = [{
      values: sampleSlice,
      labels: otuIds,
      type: 'pie',
      name: 'Sample',
      text: otuLabels,
    }];
    
    var layout = {
      title: "<b>Belly Button Samples by ID</b>",
      height: 500,
      width: 500
    };
    
    Plotly.newPlot('pie', pieData, layout);

    //clear bubble chart area
    d3.select('#bubble').html("");

    //Build a Bubble Chart using the sample data and plotly
    var trace1 = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {
        size: data.sample_values,
        sizeref: 1.5,
        color: data.otu_ids,
        colorscale: "rainbow"
      }
    };
    
    var bubbleData = [trace1];
    
    var layout = {
      title: '<b>Belly Button Sample Values by ID</b>',
      showlegend: false,
      yaxis: {autorange: true}
    };
    
    Plotly.newPlot('bubble', bubbleData, layout);
  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
