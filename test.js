var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
event.on('some_event', function() {
console.log('The time is'+new Date());
});
var timer=function(){
	setTimeout(function() {
		event.emit('some_event');
		timer();
	}, 1000);
}
timer();