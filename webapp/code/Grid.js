var Grid = (function(){
	var module = {
		id: "kalman.webapps.code.Grid",
		load: function () {
			
		},
		
		createGrid: function(parent, size){
			_createGrid(parent, size);
		}
	};
	
	// function _addGridCssProperties(parent, size){
	function _addGridCssProperties(parent, width, height){
		//var css = "#" + parent.id + " .grid{ width: " + (size - 1) + "px; height: " + (size - 1) + "px;}";
		var css = "#" + parent.id + " .grid{ width: " + (width - 1) + "px; height: " + (height - 1) + "px;}";
		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');

		style.type = 'text/css';
		if (style.styleSheet) {
			// for IE8 and below.
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}
	
	function _createGrid(parent, size) {
		var ratioW = Math.floor(parent.clientWidth / size);
		var ratioH = Math.floor(parent.clientHeight / size);

		var gridElement = document.createElement("div");
		gridElement.setAttribute("class", "grid")

		ratioW = 100;
		ratioH = 100;

		for (var i = 0; i < ratioH; i++) {
			for (var p = 0; p < ratioW; p++) {
				parent.appendChild(gridElement.cloneNode());
			}
		}
		
		//_addGridCssProperties(parent, size);
		_addGridCssProperties(parent, parent.clientWidth / 100, parent.clientHeight / 100);
	}

	return module;
}());