var KalmanFilterVariables = (function () {
	
	var module = {
		id: "kalman.webapps.code.KalmanFilterVariables",

		load: function () {
			Logger.log(module.id, "load()");
		},

		get_dt: function () {
			return dt;
		},

		get_initialState: function() {
			return initialState.slice();
		},
		
		get_measurementNoise: function () {
			return measurementNoise.slice();
		},

		get_controlSignal: function () {
			return controlSignal;
		},
		
		get_processNoise: function() {
			return processNoise.slice();
		},

		get_A: function () {
			return A.slice();
		},

		get_B: function () {
			return B.slice();
		},

		get_C: function () {
			return C.slice();
		}

	};

	/*
		Sampling rate, in second
	*/
	var dt = 1;
	
	/*	
		@dimension: 4x1
		initialState: Represents initial state with 4 components, Q
		[positionX]
		[positionY]
		[velocityX]
		[velocityY]
	*/
	var initialState = [
		[0],
		[0],
		[0],
		[0]
	];
	
	/*
		@dimension: 2x2
		measurementNoise(v_t): Measurement noise in directions, known as R in some resources
		[x_noise	0		]
		[0			y_noise	]
	*/
	var measurementNoise = [
		[0.21, 0],
		[0, 0.21]
	];
	
	var controlSignal = 0.1;
	
	/*
		@dimension: 4x4
		process noise(w_t) - Process noise covariance matrix, known as Q in some resources 
		[dt^4/4		0			dt^3/2		0		]
		[0			dt^4/4		0 			dt^3/2	]
		[dt^3/2 	0			dt^2 		0		]
		[0 			dt^3/2		0			dt^2	] * controlSignal^2
	 */
	var processNoise = _multiplyMatrix(Math.pow(controlSignal, 2),
	[
		[Math.pow(dt, 4)/4, 0, Math.pow(dt, 3)/2, 0],
		[0, Math.pow(dt, 4)/4, 0, Math.pow(dt, 3)/2],
		[Math.pow(dt, 3)/2, 0, Math.pow(dt, 2), 0],
		[0, Math.pow(dt, 3)/2, 0, Math.pow(dt, 2)]
	]);
	
	/*
		@dimension: 4x4
		A: State update transition matrix
		The nxn matrix A relates the state at the previous step to the state at the current step
		[1	0	dt	0	]
		[0	1	0	dt	]
		[0	0	1	0	]
		[0	0	0	1	]
	*/
	var A = [
		[1, 0, dt, 0],
		[0, 1, 0, dt],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	];
	
	/*
		@dimension: 4x1
		B: The nx1 matrix relates the optional control input to the predictedState.
		[dt^2/2	]
		[dt^2/2	]
		[dt		]
		[dt		]
	*/
	var B = [
		[Math.pow(dt, 2)/2],
		[Math.pow(dt, 2)/2],
		[dt],
		[dt]
	];
	
	/*
		@dimension: 2x4
		C: our measurement function that we will apply to the state estimation to get our expected next/new measurement
		The mxn matrix H in the measurement equation relates the state to the measurement y(k)
		[1 0 0 0]
		[0 1 0 0]
	*/
	var C = [
		[1, 0, 0, 0],
		[0, 1, 0, 0]
	];

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