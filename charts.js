function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("samples.json").then((data) => {
      var sampleNames = data.names;
  
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
  
      // Use the first sample from the list to build the initial plots
      var firstSample = sampleNames[0];
      buildCharts(firstSample);
      buildMetadata(firstSample);
    });
  };
  
  // Initialize the dashboard
  init();
  
  function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildMetadata(newSample);
    buildCharts(newSample);  
  };
  
  // Demographics Panel 
  function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
      var metadata = data.metadata;
      // Filter the data for the object with the desired sample number
      var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
      var result = resultArray[0];
      // Use d3 to select the panel with id of `#sample-metadata`
      var PANEL = d3.select("#sample-metadata");  
      // Use `.html("") to clear any existing metadata
      PANEL.html("");  
      // Use `Object.entries` to add each key and value pair to the panel
      Object.entries(result).forEach(([key, value]) => {
        PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
      });
    });
  };
  
  // Create the buildCharts function.
  function buildCharts(sample) {
    // Use d3.json to load and retrieve the samples.json file 
    d3.json("samples.json").then((data) => {
        // Create a variable that holds the samples array. 
        let samples = data.samples;
        // Create a variable that filters the samples for the object with the desired sample number.
        let sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
        // Create a variable that holds the first sample in the array.
        let selectedSample = sampleArray[0];
        // Create variables that hold the otu_ids, otu_labels, and sample_values.
        let otuID = selectedSample.otu_ids.toString().split(",");
        let otuLabels = selectedSample.otu_labels;
        let sampleValues = selectedSample.sample_values;

        // Create the yticks for the bar chart
        // Chain the slice() method with the map() and reverse() functions to 
        //retrieve the top 10 otu_ids sorted in descending order
        var yticks = otuID.map(function(element){
            return `OTU ${element}`;
            }).slice(0,10).reverse();

        // Create the trace for the bar chart. 
        var barData = [{
            x: sampleValues.slice(0,10).reverse(),
            y: yticks,
            text: otuLabels,
            type: "bar",
            orientation: 'h'    
        }];

        // Create the layout for the bar chart. 
        var barLayout = {
            title: 'Top 10 Bacterial Species',
            width: 450, 
            height: 400                
        };

        // Use Plotly to plot the data with the layout. 
        Plotly.newPlot("bar", barData, barLayout);

        var bubbleOTUs = selectedSample.otu_ids

        // Create the trace for the bubble chart.
        var bubbleData = [{
            x: bubbleOTUs,
            y: sampleValues,
            text: otuLabels,
            mode: 'markers',
            marker: {
                color: bubbleOTUs,
                size: sampleValues
            }
        }];

        // Create the layout for the bubble chart.
        var bubbleLayout = {
            title: 'Bacterial Cultures Per Sample',
            xaxis: {
                title: 'OTU id#'}
        };

        // Use Plotly to plot the data with the layout.
        Plotly.newPlot("bubble", bubbleData, bubbleLayout); 

        let metadata = data.metadata;
        let freqArray = metadata.filter(element => element.id == sample);
        let selectedFreq = freqArray[0];
        let wFreq = selectedFreq.wfreq;

        // Create the trace for the gauge chart.
        var gaugeData = [{
            value: wFreq,
            title: {
                text: "Belly Button Wash Frequency: # Scrubs/Week", 
                font: {size: 16}},
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: {visible: true, range: [0, 10]},
                bar: {color: 'black'},
                steps: [
                    {range: [0,2], color: "red"},
                    {range: [2,4], color: "orange"},
                    {range: [4,6], color: "yellow"},
                    {range: [6,8], color: "lightgreen"},
                    {range: [8,10], color: "green"}
                ]
            }
        }];
                 
        // Create the layout for the gauge chart.
        var gaugeLayout = { 
            width: 400, 
            height: 300                   
        };

        // Use Plotly to plot the gauge data and layout.
        Plotly.newPlot("gauge", gaugeData, gaugeLayout);
        });
    };
