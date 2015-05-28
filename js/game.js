var game = {
	resources: {
		dust: 0,
		brick: 0
	},
	parameters: {
		dustPerClick: 1,
		dustToBrick: 10,
		bricksPerDust: 1
	},
	gatherDust: function(){
		game.resources.dust += game.parameters.dustPerClick;
	},
	tick: function(){
		//console.log('ticked');
		$('.dustCount').html(game.resources.dust);
		$('.brickCount').html(game.resources.brick);
		game.showResources();
	},
	autoSave: function(){
		$('.autosaveIndicator').addClass('fadeIn');
		game.save();
		setTimeout(function() { $('.autosaveIndicator').removeClass('fadeIn'); }, 2000);
	},
	showResources: function(){
		if(game.resources.brick > 0 || game.resources.dust >= game.parameters.dustToBrick){
			$('.brickCount').removeClass('hidden');
			$('.createBrick').removeClass('hidden');
		}
	},
	resTransforms: {
		createBrick: function(numberOfBricks){
			for(i = 0; i < numberOfBricks; i++){
				if(game.resources.dust >= game.parameters.dustToBrick){
					game.resources.dust -= game.parameters.dustToBrick;
					game.resources.brick += game.parameters.bricksPerDust;
				} else {
					if(i == 0){
						game.showMessage(game.messages.cantCreateBricks);
					} else {
						game.showMessage(game.messages.cantCreateAllBricks(i, numberOfBricks));
					}
					break;
				}
			}
		}
	},
	messages: {
		cantCreateBricks: 'There is not enough dust to create a brick!',
		cantCreateAllBricks: function(numberOfBricksCreated, numberOfBricksAsked) {
			return 'There is not enough dust to create {0} bricks. Created {1} bricks.'.format(numberOfBricksAsked, numberOfBricksCreated);
		}
	},
	showMessage: function(message){
		var messageString = '<div>' + message + '</div>'
		$('.tickerPanel').first('div').prepend(messageString);
	},








	init: function(){
		game.load();
	},
	save: function(){
		localStorage.setItem("resources",JSON.stringify(game.resources));
		localStorage.setItem("parameters",JSON.stringify(game.parameters));
	},
	load: function(){
		game.resources = JSON.parse(localStorage.getItem("resources"));
		game.parameters = JSON.parse(localStorage.getItem("parameters"));
	}
};

// Bindings
$(document).ready(function(){
	game.init();
});
$(document).on('click', '.gatherDust', function(){
	game.gatherDust();
});
$(document).on('click', '.createBrick', function(){
	game.resTransforms.createBrick(1);
});
$(document).on('click', '.saveGame', function(){
	game.save();
});
$(document).on('click', '.loadGame', function(){
	game.load();
});
var timerIterations = 0;
var timer = setInterval(function () { 
							game.tick();
							if(timerIterations > 50) {
								timerIterations = 0;
								game.autoSave();
							} else {
								timerIterations++;
							}
						}, 100);
