var KalmanFiter = (function () {
	var module = {
		id: "kalman.webapps.code.KalmanFiter",
		
		load: function(){
			Logger.log(module.id, "load()");
			
			estimatedLocationImageContainerNode = document.getElementById("estimatedLocationImageContainer");
			_initialiseVariables();
		},
		
		/*
			Propogates Phase 1 - Prediction Phase of Kalman Filter
		*/
		predict: function(){
			_doKalmanFilter_predict();
		},
		
		/*
			Propogates Phase 2 - Update Phase of Kalman Filter
			observedPosition: Represents the real measured position of object as matrix
				[positionX]
				[positionY]
		*/
		update: function(observedPosition){
			_doKalmanFilter_update(observedPosition);
		},
		
		/*
			Propogates entire two phases of Kalman Filter
			observedPosition: Represents the real measured position of object as matrix
				[positionX]
				[positionY]
		*/
		doKalmanFiter: function(observedPosition){
			module.predict();
			module.update(observedPosition);
		},
		
		/*
			Returns combined estimated and observed location data set for statistic purpose
		*/
		getStatisticData: function(){
			return {
				estimated: computedLocations,
				observed: observedLocations
			}
		}
	};
	
	// DOM elements
	var estimatedLocationImageContainerNode;
	
	
	// Variables to use in equations
	
	/*
		Sampling rate, in second
	*/
	var dt;
	
	/*	
		@dimension: 4x1
		initialState: Represents initial state with 4 components, Q
		[positionX]
		[positionY]
		[velocityX]
		[velocityY]
	*/
	var initialState;
	
	/*	
		@dimension: 4x1
		computedState: Estimation of the state. Stores four candidate
		[positionX]
		[positionY]
		[velocityX]
		[velocityY]
	*/
	var computedState;
	
	/*	
		@dimension: 4x1
		predictedState: Stores predicted state of the system on phase 1. Stores four candidate
		[positionX]
		[positionY]
		[velocityX]
		[velocityY]
	*/
	var predictedState;
	
	/*
		@dimension: 2x2
		measurementNoise(v_t): Measurement noise in directions, known as R in some resources
		[x_noise	0		]
		[0			y_noise	]
	*/
	var measurementNoise;
	
	/*
	*/
	var controlSignal;
	
	/*
		@dimension: 4x4
		process noise(w_t) - Process noise covariance matrix, known as Q in some resources 
		[dt^4/4		0			dt^3/2		0		]
		[0			dt^4/4		0 			dt^3/2	]
		[dt^3/2 	0			dt^2 		0		]
		[0 			dt^3/2		0			dt^2	] * controlSignal^2
	 */
	var processNoise;
	
	/*
		@dimension: 4x4
		The predicted error covariance matrix of previous step, before measurement(phase-1: predict), initially equals to processNoise(w_t)
	*/
	var predicted_P;
	
	/*
		@dimension: 4x4
		The computed error covariance matrix of current step, after measurement(phase-2: update), initially equals to processNoise(w_t)
	*/
	var computed_P;
	
	/*
		@dimension: 4x4
		A: State update transition matrix
		The nxn matrix A relates the state at the previous step to the state at the current step
		[1	0	dt	0	]
		[0	1	0	dt	]
		[0	0	1	0	]
		[0	0	0	1	]
	*/
	var A;
	
	/*
		@dimension: 4x1
		B: The nx1 matrix relates the optional control input to the predictedState.
		[dt^2/2	]
		[dt^2/2	]
		[dt		]
		[dt		]
	*/
	var B;
	
	/*
		@dimension: 2x4
		C: our measurement function that we will apply to the state estimation to get our expected next/new measurement
		The mxn matrix C in the measurement equation relates the state to the measurement z{t}
		[1 0 0 0]
		[0 1 0 0]
	*/
	var C;
	
	// Variables to store computed data
	/*
		@dimension: nx2
		Stores computed locations
		[positionX, positionY]
	*/
	var computedLocations;
	
	/*
		@dimension: nx2
		computedVelocities: Stores computed velocities
		[positionX, positionY]
	*/
	var computedVelocities;
	
	// Variables to store observations
	/*
		@dimension: nx2
		observedLocations: Stores actual locations
		[positionX, positionY]
	*/
	var observedLocations;
	
	
	function _initialiseVariables() {
		_setRelativePosition(estimatedLocationImageContainerNode, 0, 0);
		
		dt = KalmanFilterVariables.get_dt();
		
		initialState = KalmanFilterVariables.get_initialState();
		computedState = initialState.slice();
		predictedState = initialState.slice();
		
		measurementNoise = KalmanFilterVariables.get_measurementNoise();
		controlSignal = KalmanFilterVariables.get_controlSignal();
		processNoise = KalmanFilterVariables.get_processNoise();
		
		predicted_P = processNoise.slice();
		computed_P = processNoise.slice();
		
		A = KalmanFilterVariables.get_A();
		B = KalmanFilterVariables.get_B();
		C = KalmanFilterVariables.get_C();
		
		computedLocations = [];
		computedVelocities = [];
		observedLocations = [];
	
	}
	
	function _formatLocationString(action, x, y){
		return action + " Location[x, y]: [" + x + ", " + y + " ]";  
	}
	
	function _printLogToDisaplay(content){
		logOutput.innerHTML += content + "<br>";
		
		Logger.log(module.id, content);
	} 
	
	/*
		Assigns left and top css properties in percentage according to given values
	*/
	function _setRelativePosition(node, top, left){
		node.style.top = (100 - top) + "%";
		node.style.left = left + "%";
	}
	
	/*
		Stores actual and computed data
		observedPosition: [positionX, positionY]
	*/
	function _storeData(observedPosition){
		computedLocations.push([ computedState[0], computedState[1] ]);
		computedVelocities.push([ computedState[2], computedState[3] ]);
		observedLocations.push([ observedPosition[0], observedPosition[1] ]);

		_printLogToDisaplay(_formatLocationString("1 - Predicted", predictedState[0], predictedState[1]));
		_printLogToDisaplay(_formatLocationString("2 - Computed", computedState[0], computedState[1]));
		_printLogToDisaplay(_formatLocationString("3 - Observed", observedPosition[0], observedPosition[1]));
	}
	
	/*
		This step is to predict 
			- the state
			- covariance P(predicted_P) 
		of the system state at the time step t
	*/
	function _doKalmanFilter_predict(){
		// Predict next state of the object with the last state and predicted motion.
		// 4x4 * 4x1 + 4x1 * N -> 4x1  
		// predictedState = A * computedState{t-1} + B * controlSignal
		predictedState = _addMatrices( _multiplyMatrices(A, computedState), _multiplyMatrix(controlSignal, B) ) ;
	
		// Predict next covariance
		// 4x4 * 4x4 * 4x4 + 4x4 -> 4x4
		// predicted_P = A * computed_P{t-1} * A' + processNoise
		predicted_P = _addMatrices( _multiplyMatrices( _multiplyMatrices(A, computed_P), _transposeMatrix(A) ), processNoise );	
	}
	
	/*
		At the time step k , this update step computes
			- K(Kalman Gain), 
			- computedState, 
			- covariance P(computed_P) 
		of the system state by using given position
		
		observedPosition: Represents the real measured position of object as matrix
				[positionX]
				[positionY]
	*/
	function _doKalmanFilter_update(observedPosition){		
		// Calculate Kalman Gain - K
		// 4x4 * 4x2 * (2x4 * 4x4 * 4x2) -> 4x2
		// K = predicted_P{t} * C' * (C * predicted_P'{t} * C' + measurementNoise) ^ (-1);
		var K = _multiplyMatrices( _multiplyMatrices(predicted_P, _transposeMatrix(C)), _powerMatrix( _addMatrices( _multiplyMatrices( _multiplyMatrices(C, _transposeMatrix(predicted_P) ), _transposeMatrix(C) ), measurementNoise), -1) );
		
		// 2x4*4x1 + 2x1
		// z = C*computedState + v_t
		//observedPosition = _addMatrices( _multiplyMatrices(C, computedState),  );
		
		// computedState = A * predictedState{t} +  K{t} * (observedPosition{t} - C * A * predictedState{t} )
		// 4x4 * 4x1 + 4x2 * (2x1 - 2x4 * 4x4 * 4x1) -> 4x1
		computedState = _addMatrices( _multiplyMatrices(A, predictedState), _multiplyMatrices( K, _subtractMatrices( observedPosition, _multiplyMatrices( _multiplyMatrices(C, A), predictedState) ) ) );
		
		// update error covariance estimation.
		// 4x4 - 4x2 * 2x4 * 4x4 ->  
		// computed_P =  (1 - K{t} * C) * predicted_P{t}
		computed_P = _multiplyMatrices(_subtractMatrices(_identityMatrix(4), _multiplyMatrices(K, C)), predicted_P );
		
		// Set the computed location to the image to show on the GUI
		_setRelativePosition(estimatedLocationImageContainerNode, computedState[1], computedState[0]);
		
		
		_storeData(observedPosition);
	}
	
	// Matrix operations
	
	/*
		Returns transpose matrix of given matrix
	*/
	function _transposeMatrix(matrix) {
		if (matrix instanceof Array) {
			var result = [];
			
			for (var row = 0; row < matrix.length; row++) {
				for (var column = 0; column < matrix[0].length; column++) {
					if (row == 0) {
						result.push([]);
					}
					
					result[column].push(matrix[row][column]);
				}
			}
			
			return result;
		}
	}
	
	/*
		Produces nxn dimension identity matrix and returns the produced one
		Example: 
				[1 0 0]
				[0 1 0]
				[0 0 1]
	*/
	function _identityMatrix(n){
		if(n > 0){
			var result = [];
			
			for(var row = 0; row < n; row++){
				result.push([]);
				
				for(var column = 0; column < n; column++){
					result[row][column] = (row == column) ? 1 : 0;
				}
			}
			
			return result;
		}
	}
	
	/*
		Exponents mxn dimensioned matrix
		Output: mxn dimensioned matrix
	*/
	function _powerMatrix(matrix, power){
		if (matrix instanceof Array){
			var result = [];

			for (var row = 0; row < matrix.length; row++) {
				result.push([]);
				
				for (var column = 0; column < matrix[0].length; column++) {
					result[row][column] = (matrix[row][column] == 0) ? 0 : Math.pow(matrix[row][column], power);
				}
			}
			
			return result;
		}
	}
	
	/*
		Subtracts mxn and mxn dimensioned matrices
		Output: mxn dimensioned matrix
	*/
	function _subtractMatrices(matrix1, matrix2) {
		if (matrix1 instanceof Array && matrix2 instanceof Array) {
			if (matrix1.length == matrix2.length && matrix1[0].length == matrix2[0].length) {
				var result = [];

				for (var row = 0; row < matrix1.length; row++) {
					result.push([]);
					
					for (var column = 0; column < matrix1[0].length; column++) {
						result[row][column] = matrix1[row][column] - matrix2[row][column];
					}
				}
				
				return result;
			}
		}
	}
	
	/*
		Adds mxn and mxn dimensioned matrices
		Output: mxn dimensioned matrix
	*/
	function _addMatrices(matrix1, matrix2) {
		if (matrix1 instanceof Array && matrix2 instanceof Array) {
			if (matrix1.length == matrix2.length && matrix1[0].length == matrix2[0].length) {
				var result = [];

				for (var row = 0; row < matrix1.length; row++) {
					result.push([]);
					
					for (var column = 0; column < matrix1[0].length; column++) {
						result[row][column] = matrix1[row][column] + matrix2[row][column];
					}
				}
				
				return result;
			}
		}
	}
	
	/*
		Multiplies kxm and mxn dimensioned matrices
		Output: kxn dimensioned matrix
	*/
	function _multiplyMatrices(matrix1, matrix2) {
		if (matrix1 instanceof Array && matrix2 instanceof Array) {
			if (matrix1[0].length == matrix2.length) {
				var result = [];

				for (var row = 0; row < matrix1.length; row++) {
					result.push([]);
					
					for (var column = 0; column < matrix2[0].length; column++) {
						var sum = 0;
						for (var index = 0; index < matrix1[0].length; index++) {
							sum += matrix1[row][index] * matrix2[index][column];
						}

						result[row][column] = sum;
					}
				}
				
				return result;
			}
		}
	}
	
	/*
		Multiplies a number N and mxn dimensioned matrix
		Output: mxn dimensioned matrix
	*/
	function _multiplyMatrix(number, matrix) {
		if (matrix instanceof Array) {
			var result = [];

			for (var row = 0; row < matrix.length; row++) {
				result.push([]);
				
				for (var column = 0; column < matrix[0].length; column++) {
					result[row][column] = matrix[row][column] * number;
				}
			}
			
			return result;
		}
	}
	
	return module;

}());