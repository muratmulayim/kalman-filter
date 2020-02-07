var Bootloader = (function(){
	var module = {
		id: "kalman.webapps.code.Bootloader",
		load: function () {
			Logger.load();
			KalmanFilterVariables.load();
			KalmanFiter.load();
			_initialiseElements();
			resetPositions();

			OBJECT_MOVE_INTERVAL = 300; // 300ms
			// locationData = Data.locationMatrixTest;
			// locationData = Data.locationMatrixActual;
			locationData = Data.locationMatrixActual2;

			if (locationData && locationData.length > 0) {
				setLocationTimer = setTimeout(_setLocation, OBJECT_MOVE_INTERVAL, 0);
			}
		},
		
		proceedButtonClick: function(){
			proceedButtonNode.classList.remove("clicked");
			proceedButtonNode.classList.add("clicked");
			
			/*
				Button click animations
			*/
			setTimeout(function(){
				proceedButtonNode.classList.remove("clicked");
			}, 100);
			
			setTimeout(function(){
				window.location.href = window.location.href;
			}, 100);
		}
	};
	
	
	var mapElement;
	var objectImageContainerNode;
	var observedLocationImageContainerNode;
	var proceedButtonNode;
	var logOutputNode;
	var locationData;
	var setLocationTimer;
	var OBJECT_MOVE_INTERVAL = 300; // in millisecond
	
	var DOMfunctions = {
		show: function(node){
			node.classList.remove("hidden");
		},
		hide: function(node){
			node.classList.add("hidden");
		}
	};
	
	function resetPositions(){
		_setRelativePosition(objectImageContainerNode, 0, 0);
		_setRelativePosition(observedLocationImageContainerNode, 0, 0);
	}
	
	function _initialiseElements(){
		mapElement = document.getElementById("map");
		objectImageContainerNode = document.getElementById("objectImageContainer");
		observedLocationImageContainerNode = document.getElementById("observedLocationImageContainer");
		proceedButtonNode = document.getElementById("proceedButton");
		
		logOutputNode = document.getElementById("logOutput");
		
		Grid.createGrid(mapElement, 10);
	}
	
	function _setRelativePosition(node, top, left){
		node.style.top = (100 - top) + "%";
		node.style.left = left + "%";
		
		// logOutput.innerHTML = logOutput.innerHTML + node.id + ": " + node.style.top + ", " + node.style.left + "<br>";
	}
	
	function _setLocation(index) {
		clearTimeout(setLocationTimer);
		
		var top = locationData[index][1];
		var left = locationData[index][0];

		_setRelativePosition(objectImageContainerNode, top, left);
		_setRelativePosition(observedLocationImageContainerNode, top, left);

		KalmanFiter.doKalmanFiter([
				[left],
				[top]
			]);

		if (index < locationData.length - 1) {
			setLocationTimer = setTimeout(_setLocation, OBJECT_MOVE_INTERVAL, index + 1);
		}else{
			DOMfunctions.show(document.getElementById("chartContainer"));
			Statistics.showStatistics("chartContainer", KalmanFiter.getStatisticData());
		}
	}
	
	return module;
}());