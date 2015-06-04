var game = {
	resources: {
		dust: 0,
		scrap: 0,
		brick: 0,
		fire: 0,

		change: function(name, quantity){
			if(game.resources[name] != null && (quantity >= 0 || (quantity < 0 && game.resources[name] >= (-quantity)))){
				game.resources[name] += quantity;
				return true;
			}
			return false;
		}
	},
	upgrades:[
		{ active: function(){ return true; }, dust: 1 },
		{ active: function(){ return game.flags.hasShovel;}, dust: 1.5 }
	],
	modifiers: {
		dust: function(){
			return Enumerable.From(game.upgrades).Where("$.active()").Select("$.dust").Aggregate("(x,y) => x * y");
		}
	},
	parameters: {
		dustPerClick: 1,
		dustToBrick: -10,
		bricksPerDust: 1,
		fireBurningPerTick: -1,
		dustToFire: -5,
		firePerKindle: 50,
		strongFireCount: 1500,
		dustToShovel: 20,
		scrapChance: 0.2,
		scrapPerClick: 1
	},
	flags: {
		canMakeBricks: false,
		thunderStruck: false,
		hasFire: false,
		firstKindle: true,
		strongFire: false,
		hasBricks: false,
		canCreateStuff: false,
		hasShovel: false,
		hasScraps: false
	},
	strings: {
		gatherDustButton: 'Gather Dust',
		meltDustButton: 'Melt dust together',
		createBrickButton: 'Create Brick',
		kindleFire: 'Kindle Fire',
		createShovel: 'Create Shovel'
	},
	messages: {
		cantCreateBricks: 'There is not enough dust to create a brick!',
		cantCreateAllBricks: function(numberOfBricksCreated, numberOfBricksAsked) {
			return 'There is not enough dust to create {0} bricks. Created {1} bricks.'.format(numberOfBricksAsked, numberOfBricksCreated);
		},
		thunderStruck: 'A thunder has hit the dust near you. The dust is on fire!',
		noDustToKindle: 'Not enough dust to kindle the fire with',
		firstKindle: 'You start to feel \'not cold\' for the first time in a long while.',
		strongFire: 'The fire seems to be really strong now. Maybe we can cook something'
	},
	events: [
		{
			name: 'Thunder',
			chance: 0.3, 
			happens: function(){ 
				if(!game.flags.hasFire){
					game.resources.fire += 1000;
					game.flags.thunderStruck = true;
					game.flags.hasFire = true;
					game.showMessage(game.messages.thunderStruck);
				}
			}
		}
	],


	// Resource functions
	gatherDust: function(){
		game.resources.change('dust', game.parameters.dustPerClick * game.modifiers.dust());
			var thisChance = Math.random();
			console.log(thisChance);
		if(thisChance <= game.parameters.scrapChance){
			game.resources.change('scrap', game.parameters.scrapPerClick);
			game.flags.hasScraps = true;
		}
	},
	createShovel: function(){
		if(game.resources.change('dust', game.parameters.dustToShovel)){
			game.stuff.add()
		}
	},
	kindleFire: function(){
		if(game.resources.change('dust', game.parameters.dustToFire)){
			game.resources.change('fire', game.parameters.firePerKindle);
			if(game.flags.firstKindle){
				game.flags.firstKindle = false;
				game.showMessage(game.messages.firstKindle);
			}
		}
		else{
			game.showMessage(game.messages.noDustToKindle);
		}
	},
	createBrick: function(numberOfBricks){
		for(i = 0; i < numberOfBricks; i++){
			if(game.resources.change('dust', game.parameters.dustToBrick)){
				game.resources.change('brick', game.parameters.bricksPerDust);
			} else {
				if(i == 0){
					game.showMessage(game.messages.cantCreateBricks);
				} else {
					game.showMessage(game.messages.cantCreateAllBricks(i, numberOfBricks));
				}
				break;
			}
		}
	},
	updateResources: function(){
		game.resources.change('fire', game.parameters.fireBurningPerTick);
		if(game.resources.fire >= game.parameters.strongFireCount && !game.flags.strongFire){
			game.flags.strongFire = true;
			if(game.resources.brick <= 0){
				game.showMessage(game.messages.strongFire);
			}
		}
		if(game.resources.fire < game.parameters.strongFireCount && game.flags.strongFire){
			game.flags.strongFire = false;
		}
	},
	showResources: function(){
		if(game.flags.hasFire){
			$('.kindleFire').removeClass('hidden');
			$('.kindleFire').html(game.strings.kindleFire);
		}
		if(game.flags.strongFire){
			game.flags.hasBricks = true;
			$('.createBrick').attr("disabled", false);
		}
		else{
			$('.createBrick').attr("disabled", true);
		}
		if(game.flags.hasBricks){
			$('.createBrick').removeClass('hidden');
			$('.createBrick').html(game.strings.meltDustButton);
			$('.brickCount').removeClass('hidden');
			$('.buildingsTab').removeClass('hidden');
		}
		if(game.flags.hasScraps){
			$('.scrapCount').removeClass('hidden');
		}
	},
	tick: function(){
		game.updateResources();
		//console.log('ticked');
		$('.dustCount').html(game.resources.dust);
		$('.brickCount').html(game.resources.brick);
		$('.fireCount').html(game.resources.fire);
		$('.scrapCount').html(game.resources.scrap);
		game.showResources();
	},
	autoSave: function(){
		$('.autosaveIndicator').addClass('fadeIn');
		game.save();
		setTimeout(function() { $('.autosaveIndicator').removeClass('fadeIn'); }, 2000);
	},
	showMessage: function(message){
		var messageString = '<div>' + message + '</div>'
		$('.tickerPanel').first('div').prepend(messageString);
	},






	doEvents: function() {
		for (var i = game.events.length - 1; i >= 0; i--) {
			var thisChance = Math.random();
			if(thisChance <= game.events[i].chance)
				game.events[i].happens();
		};
	},
	init: function(){
		game.load();
	},
	reset: function(){
		game.resources = {};
		game.parameters = {};
		game.save();
		location.reload();
	},
	save: function(){
		localStorage.setItem("resources",JSON.stringify(game.resources));
		localStorage.setItem("parameters",JSON.stringify(game.parameters));
		localStorage.setItem("flags",JSON.stringify(game.flags));
	},
	load: function(){
		var resources = JSON.parse(localStorage.getItem("resources"));
		$.extend(game.resources, resources);
		var parameters = JSON.parse(localStorage.getItem("parameters"));
		$.extend(game.parameters, parameters);
		var flags = JSON.parse(localStorage.getItem("flags"));
		$.extend(game.flags, flags);
	}
};

// Bindings
$(document).ready(function(){
	game.init();
	$('.progress-button').progressInitialize();
	$('.gatherDust').html(game.strings.gatherDustButton);
	$('.createBrick').html(game.strings.createBrickButton);
	$('.createShovel').html(game.strings.createShovel);
});
$(document).on('click', '.gatherDust', function(){
	game.gatherDust();
});
$(document).on('click', '.createBrick', function(){
	if(!game.flags.canMakeBricks && game.flags.thunderStruck){
		$('.brickCount').removeClass('hidden');
		$('.createBrick').html(game.strings.createBrickButton);
		game.flags.canMakeBricks = true;
	}

	game.createBrick(1);
});
$(document).on('click', '.kindleFire', function(){
	game.kindleFire();
});
$(document).on('click', '.saveGame', function(){
	game.save();
});
$(document).on('click', '.loadGame', function(){
	game.load();
});
$(document).on('click', '.resetGame', function(){
	if(confirm('Are you sure you want to reset the game?')){
		game.reset();
	};
});
var timerIterations = 0;
var timer = setInterval(function () { 
							game.tick();
							if(timerIterations > 50) {
								timerIterations = 0;
								game.doEvents();
								game.autoSave();
							} else {
								timerIterations++;
							}
						}, 100);
