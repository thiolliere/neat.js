/* rock-paper-scissors */

var networkRenderer = new sigma({
	container : 'network_graph',
	settings : {
		maxEdgeSize : 10
	}
});
var graphRenderer = new sigma({
	container : 'performance_graph',
	settings : {
		maxEdgeSize : 10
	}
});


var brain,
	numberOfGame = 100000,
	numberOfHand =100,
	delayBetweenGame = 0.0001,
	gameInc = 0,
	bestScore = -Infinity;

brain = createNeat({
	numberOfInputs : 2,
	numberOfOuputs : 2,
	population : 10
});

function round(array) {
	var result = [];
	for (var i=0; i<array.length; i++) {
		result[i] = Math.round(array[i]);
	}
	return result;
}
function playGame () {
	var score = 0,
	act,reply,inputs,outputs,
	j;

	gameInc++;
	for (j=0; j<numberOfHand; j++) {
		act = Math.floor(Math.random()*3);
		inputs = [act & 01, (act & 02)>> 01];
		outputs = round(brain.compute(inputs));
		if (isNaN(outputs[0]) || isNaN(outputs[1])) {
			console.log(brain.getSigmaNetwork());
			updateScreen();
			throw("error");
		}
		reply = outputs[0] + 2*outputs[1];
		if (reply === 3) {
			score--;
		} else if (act === reply - 1 || act == reply + 2) {
			score++;
		} else if(act !== reply) {
			score--;
		}
	}
	brain.setFitness(score);
	if (score > bestScore) {
		bestScore = score;
	}

	if (gameInc%100 === 0) {
		updateScreen();
	}
	brain.evolve();
	if (gameInc<numberOfGame) {
		window.setTimeout(playGame, delayBetweenGame);
	}
}

playGame();

function updateScreen() {
	var outputs,intputs,text,replies = [],
	tab = ["rock","paper","scissors","fail"];

	outputs = round(brain.compute([0,0]));
	replies[0] = outputs[0] + 2*outputs[1];
	outputs = round(brain.compute([1,0]));
	replies[1] = outputs[0] + 2*outputs[1];
	outputs = round(brain.compute([0,1]));
	replies[2] = outputs[0] + 2*outputs[1];

	text = "game "+gameInc+"; replies : \n\trock->"+tab[replies[0]]+"\tpaper->"+tab[replies[1]]+"\tscissors->"+tab[replies[2]];

	outputs = round(brain.bestCompute([0,0]));
	replies[0] = outputs[0] + 2*outputs[1];
	outputs = round(brain.bestCompute([1,0]));
	replies[1] = outputs[0] + 2*outputs[1];
	outputs = round(brain.bestCompute([0,1]));
	replies[2] = outputs[0] + 2*outputs[1];

	text = text+"                            best score : "+bestScore+"; replies : \n\trock->"+tab[replies[0]]+"\tpaper->"+tab[replies[1]]+"\tscissors->"+tab[replies[2]];


	p = document.getElementById("text_information");
	p.replaceChild(document.createTextNode(text),p.firstChild);

	networkRenderer.graph.clear();
	networkRenderer.graph.read(brain.getSigmaNetwork());
	networkRenderer.refresh();

	graphRenderer.graph.addNode({
		id : gameInc,
		label : -brain.getFitness(),
		x : gameInc,
		y : -brain.getFitness()*100,
		size : 1,
		color : '#555'
	});
	graphRenderer.refresh();
}
