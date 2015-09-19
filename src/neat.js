function createNeat(spec) {
	var population = spec.population || 300, // assert > 0
	deltaDisjoint = spec.deltaDisjoint || 2.0,
	deltaWeights = spec.deltaWeights || 0.4,
	deltaThreshold = spec.deltaThreshold || 1.0,

	staleSpecies = spec.staleSpecies || 15,

	mutateConnectionsChances = spec.mutateConnectionsChances || 0.25,
	perturbChance = spec.perturbChance || 0.90,
	crossoverChance = spec.crossoverChance || 0.75,
	linkMutationChance = spec.linkMutationChance || 2.0,
	nodeMutationChance = spec.nodeMutationChance || 0.50,
	biasMutationChance = spec.biasMutationChance || 0.40,
	stepSize = spec.stepSize || 0.1,
	disableMutationChance = spec.disableMutationChance || 0.4,
	enableMutationChance = spec.enableMutationChance || 0.2,

	numberOfInputs = spec.numberOfInputs, // assert exist
	numberOfOuputs = spec.numberOfOuputs, // assert exist

	maxNodes = spec.maxNodes || 1000000,
	display = {
		line : spec.display.line || numberOfInputs,
		column : spec.display.column || 1,
		bps : spec.display.bps || 1,
	};
	if (spec.display) {
		display = {
			line : spec.display.line,
			column : spec.display.column,
			bps : spec.display.bps,
		},
	}

	var pool = createPool({
		population : population,
		deltaDisjoint : deltaDisjoint,
		deltaWeights : deltaWeights,
		deltaThreshold : deltaThreshold,

		staleSpecies : staleSpecies,

		mutateConnectionsChances : mutateConnectionsChances,
		perturbChance : perturbChance,
		crossoverChance : crossoverChance,
		linkMutationChance : linkMutationChance,
		nodeMutationChance : nodeMutationChance,
		biasMutationChance : biasMutationChance,
		stepSize : stepSize,
		disableMutationChance : disableMutationChance,
		enableMutationChance : enableMutationChance,

		numberOfInputs : numberOfInputs,
		numberOfOuputs : numberOfOuputs,

		maxNodes : maxNodes,
		display : display,
	}),
	function compute(inputs) {
		return pool.evaluateCurrentGenome();
	},
	function setFitness(fitness) {
		pool.setFitnessOfCurrentGenome(fitness);
	},
	function getFitess() {
		pool.getFitnessOfCurrentGenome();
	},
	function addFitness(fitness) {
		pool.setFitnessOfCurrentGenome(pool.getFitnessOfCurrentGenome()+fitness);
	},
	function evolve() {
		pool.setCurrentGenomeNextOne();
	},
	function changeFitnessEvaluation() {
		resetAllFitness();
		pool.setCurrentGenomeFirstOne();
	};

	return Object.freeze({
		compute : compute,
		setFitness : setFitness,
		getFitness : getFitness,
		addFitness : addFitness,
		evolve : evolve,
		changeFitnessEvaluation : changeFitnessEvaluation,
	});
};
