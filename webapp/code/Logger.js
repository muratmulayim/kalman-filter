var Logger = (function () {
    var IS_LOGGING_ENABLED = true;

    var module = {
        id: "kalman.webapps.code.Logger",

        log: function (id, msg) {
            if(IS_LOGGING_ENABLED) {
				var date = new Date();
				var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
                console.log(time + " - [ " + id + " ] -- " + msg);
            }
        },

        load: function () {
            if(IS_LOGGING_ENABLED){
				module.log(module.id, "load()");
			}
        }
    };

    return module;
}());
