var Statistics = (function () {
	var module = {
		id: "kalman.webapps.code.Statistics",
		load: function () {
			Logger.load();
			KalmanFiter.load();
			_initialiseElements();
			resetPositions();

			locationData = Data.locationMatrixActual;

			if (locationData && locationData.length > 0) {
				setLocationTimer = setTimeout(_setLocation, 1000, 0);
			}
		},

		/*
			data:
			{
				estimated: [ [location_X, location_Y] ],
				observed: [ [location_X, location_Y] ]
			}
		 */
		showStatistics: function (parentId, data) {
			if (data && data.estimated && data.observed) {

				var estimated = {
					x: [],
					y: [],
					text: [],
					name: 'Estimated',
					mode: 'lines+markers',
					marker: {
						color: 'rgb(165, 255, 0)',
						size: 8
					},
					line: {
						color: 'rgb(165, 255, 0)',
						width: 3
					}
				};

				var observed = {
					x: [],
					y: [],
					text: [],
					name: 'Observed',
					mode: 'lines+markers',
					marker: {
						color: 'rgb(59, 20, 255)',
						size: 8
					},
					line: {
						color: 'rgb(59, 20, 255)',
						width: 3
					}
				};

				for (var i = 0; i < data.estimated.length; i++) {
					var error_X = Math.abs(data.estimated[i][0][0] - data.observed[i][0][0])/100;
					var error_Y = Math.abs(data.estimated[i][1][0] - data.observed[i][1][0])/100;
					estimated.x.push(data.estimated[i][0][0]);
					estimated.y.push(data.estimated[i][1][0]);
					estimated.text.push("Sample-" + (i + 1) + "<br>" +
										"Observed:  [ " + data.observed[i][0][0] + ", " + data.observed[i][1][0] + " ] <br>" + 
										"Estimated: [ " + data.estimated[i][0][0] + ", " + data.estimated[i][1][0] + " ] <br>" + 
										"Error Rate X: " + error_X + "<br>" + 
										"Error Rate Y: " + error_Y);

					observed.x.push(data.observed[i][0][0]);
					observed.y.push(data.observed[i][1][0]);
					observed.text.push("Sample-" + (i + 1) + "<br>" +
										"Observed:  [ " + data.observed[i][0][0] + ", " + data.observed[i][1][0] + " ] <br>" + 
										"Estimated: [ " + data.estimated[i][0][0] + ", " + data.estimated[i][1][0] + " ] <br>" +
										"Error Rate X: " + error_X + "<br>" + 
										"Error Rate Y: " + error_Y);
				}

				var data = [estimated, observed];
				var layout = {
					title: 'Kalman Filter - Observed & Estimated Chart' + Plotly.version
				};
				
				var config = {
					displayModeBar: true,
					displaylogo: false,
					sendData: false,
					modeBarButtonsToRemove: ["toImage", "zoom2d", "pan2d", "sendDataToCloud", "autoScale2d", "select2d", "lasso2d", "autoScale2d", "resetScale2d", "hoverCompareCartesian"]
					
				};
				Plotly.newPlot(parentId, data, layout, config);
			}

		},

		hideStatistics: function () {}
	}

	var mapElement;

	return module;
}
	());
