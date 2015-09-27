//require('./pool.js');

function createNeat(spec) {
	var spec = spec || {},
	population = spec.population || 100, // assert > 0

	deltaDisjoint = spec.deltaDisjoint || 2.0,
	deltaWeights = spec.deltaWeights || 0.4,
	deltaThreshold = spec.deltaThreshold || 1.0,

	staleSpecies = spec.staleSpecies || 15,
	crossoverChance = spec.crossoverChance || 0.75,

	mutateConnectionsChances = spec.mutateConnectionsChances || 0.25,
	perturbChance = spec.perturbChance || 0.90,
	linkMutationChance = spec.linkMutationChance || 3.0,
	nodeMutationChance = spec.nodeMutationChance || 2.0,
	biasMutationChance = spec.biasMutationChance || 0.40,
	stepSize = spec.stepSize || 0.1,
	disableMutationChance = spec.disableMutationChance || 0.4,
	enableMutationChance = spec.enableMutationChance || 0.3,

	numberOfInputs = spec.numberOfInputs, // assert exist
	numberOfOuputs = spec.numberOfOuputs, // assert exist

//	display = {
//		line : spec.display.line || numberOfInputs,
//		column : spec.display.column || 1,
//		bps : spec.display.bps || 1,
//	};
//	if (spec.display) {
//		display = {
//			line : spec.display.line,
//			column : spec.display.column,
//			bps : spec.display.bps,
//		};
//	}

	pool	= createPool({
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

//		display : display,
	}),
	compute =function(inputs) {
		return pool.evaluateCurrentGenome(inputs);
	},
	setFitness = function(fitness) {
		pool.setFitnessOfCurrentGenome(fitness);
	},
	getFitness = function() {
		return pool.getFitnessOfCurrentGenome();
	},
	addFitness = function(fitness) {
		pool.setFitnessOfCurrentGenome(pool.getFitnessOfCurrentGenome()+fitness);
	},
	evolve = function() {
		pool.setCurrentGenomeNextOne();
	},
	changeFitnessEvaluation = function() {
		pool.resetAllFitness();
		pool.setCurrentGenomeFirstOne();
	},
	getSigmaNetwork = function() {
		return pool.exportSigmaCurrent();
	},
	bestCompute = function(inputs) {
		return pool.evaluateBestGenome(inputs);
	};

	return Object.freeze({
		compute : compute,
		setFitness : setFitness,
		getFitness : getFitness,
		addFitness : addFitness,
		evolve : evolve,
		changeFitnessEvaluation : changeFitnessEvaluation,
		getSigmaNetwork : getSigmaNetwork,
		bestCompute : bestCompute,
	});
}
