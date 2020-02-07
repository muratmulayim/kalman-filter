var Painter = (function(){
	var module = {
		id: "kalman.webapps.code.Painter",
		
		load: function(){
			logOutputNode = document.getElementById("logOutput");
			canvas = document.getElementById('myCanvas');
			context = canvas.getContext('2d');
			
			context.lineWidth = 5;
			context.lineJoin = 'round';
			context.lineCap = 'round';
			context.strokeStyle = 'blue';
			
			canvasDimensions.width = canvas.clientWidth;
			canvasDimensions.height = canvas.clientHeight;
			
			mouse = {x: 0, y: 0};
			last_mouse = {x: 0, y: 0};
			
			_addListeners();
			
		}
	};
	
	var canvas;
	var logOutputNode;
	var context;
	
	var mouse;
	var last_mouse;
	var canvasDimensions = {};
	
	var keepCanvas = false;
	var path = [];
	
	function _resetView(){
		path = [];
		logOutputNode.innerHTML = "";
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	function _printPath(){
		for(var i = 0; i < path.length; i++){
			logOutputNode.innerHTML = logOutput.innerHTML + "[" + path[i][0]  + "," + path[i][1] + "]," + "<br>";
		}
	}
	
	function _onPaint(){
		Logger.log(module.id, "mousedown _onPaint() listener triggered.");
		
		context.beginPath();
		context.moveTo(last_mouse.x, last_mouse.y);
		context.lineTo(mouse.x, mouse.y);
		context.closePath();
		context.stroke();
		
		var x_location = Math.floor(100 * mouse.x / canvasDimensions.width);
		var y_location = Math.floor(100 * mouse.y / canvasDimensions.height);
		path.push([x_location, 100 - y_location]);
		
		Logger.log(module.id, "[" + x_location  + "," + y_location + "]");
	}
	
	function _onMouseMove(e){
		last_mouse.x = mouse.x;
		last_mouse.y = mouse.y;

		mouse.x = e.clientX; 
		mouse.y = e.clientY; 
	}
	
	function _addListeners() {
		canvas.addEventListener('mousemove', _onMouseMove, false);

		canvas.addEventListener('mousedown', function (e) {
			Logger.log(module.id, "mousedown listener triggered.");
			
			canvas.addEventListener('mousemove', _onPaint, false);

			_resetView();
			
			keepCanvas = !keepCanvas;
		}, false);

		canvas.addEventListener('mouseup', function (e) {
			Logger.log(module.id, "mousemove listener triggered.");
			
			canvas.removeEventListener('mousemove', _onPaint, false);
			
			if(keepCanvas){
				_printPath();
			}
			keepCanvas= false;
		}, false);
		
		canvas.addEventListener('mouseout', function (e) {
			Logger.log(module.id, "mouseout listener triggered.");
			
			canvas.removeEventListener('mousemove', _onPaint, false);
			
			if(keepCanvas){
				_printPath();
			}
			
			keepCanvas = false;
		}, false);
	}
	
	return module;
}());