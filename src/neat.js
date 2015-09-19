neat = {};
{
	population : 300,
	deltaDisjoint : 2.0,
	deltaWeights : 0.4,
	deltaThreshold : 1.0,

	staleSpecies : 15,

	mutateConnectionsChance : 0.25,
	perturbChance : 0.90,
	crossoverChance : 0.75,
	linkMutationChance : 2.0,
	nodeMutationChance : 0.50,
	biasMutationChance : 0.40,
	stepSize : 0.1,
	disableMutationChance : 0.4,
	enableMutationChance : 0.2,

	timeoutConstant : 20,

	maxNodes : 1000000,

	numberOfOutputs = 4;
	numberOfInputs = 100;
};

/* method */
create
/* evaluate : BOF */
obj.evaluate(inputs);
obj.setFitness();
obj.getFitness();
obj.addFitness(relativeNumber);
obj.evolve();
/* automticly reset current fitness */
obj.changeFitnessEvaluation();

/* on peut imaginer different model :
 * avec une evaluation de la performance a sa mort
 * avec une evaluation de la performance de maniere asynchrone 
 * (tout le  temps) et une method pour tuer
 * avec evaluation tout le temps et une vie chronométré...
