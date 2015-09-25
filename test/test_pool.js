var pool = createPool({
	pertubChance : 0.90,	
	mutationConnetionsChance : 0.25,
	linkMutationChance : 2.0,
	nodeMutationChance : 0.50,
	enableMutationChance : 0.2,
	disableMutationChance : 0.4,
	stepSize : 0.1,
	numberOfInputs : 3,
	numberOfOuputs : 2,
	maxNodes : 10000000,
	newInnovation : createNewInnovation(),
	deltaDisjoint : 2.0,
	deltaWeights : 0.4,
	deltaThreshold : 1.0,

	staleSpecies : 15,
	crossoverChance : 0.75,
	population : 6,
}),
	delay=1000,
	s = new sigma({
		graph : {nodes:[{id:"7",x:0,y:0}]},
		container : 'container',
		settings : {
			maxEdgeSize : 10
		}
	}),
	one = function() {
	}

