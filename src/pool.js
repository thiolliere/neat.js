//require('./genome.js');

function createPool(spec) {
	/* var for genome */
	var perturbChance = spec.perturbChance,
	mutateConnectionsChances = spec.mutateConnectionsChances,
	linkMutationChance = spec.linkMutationChance,
	nodeMutationChance = spec.nodeMutationChance,
	enableMutationChance = spec.enableMutationChance,
	disableMutationChance = spec.disableMutationChance,
	biasMutationChance = spec.biasMutationChance,
	stepSize = spec.stepSize,
	numberOfInputs = spec.numberOfInputs,
	numberOfOuputs = spec.numberOfOuputs,
	deltaDisjoint = spec.deltaDisjoint,
	deltaWeights = spec.deltaWeights,
	deltaThreshold = spec.deltaThreshold,
	innovation = -1,
	newInnovation = function() {
		innovation++;
		return innovation;
	},
	//	display = {
	//		line : spec.display.line,
	//		column : spec.display.column,
	//		bps : spec.display.bps
	//	},
	/* var for pool */
	crossoverChance = spec.crossoverChance,
	staleSpecies = spec.staleSpecies,
	population = spec.population, // assert > 0

	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	randomInteger = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	createGenome = createGenomeConstrutor({
		perturbChance : perturbChance,
		mutateConnectionsChances : mutateConnectionsChances,
		linkMutationChance : linkMutationChance,
		nodeMutationChance : nodeMutationChance,
		enableMutationChance : enableMutationChance,
		disableMutationChance : disableMutationChance,
		biasMutationChance : biasMutationChance,
		stepSize : stepSize,
		numberOfInputs : numberOfInputs,
		numberOfOuputs : numberOfOuputs,
		maxNodes : maxNodes,
		newInnovation : newInnovation,
		deltaDisjoint : deltaDisjoint,
		deltaWeights : deltaWeights,
		deltaThreshold : deltaThreshold,
		//		display : display
	}),
	species = [], // array of species
	maxFitness, // the max fitness of all genome
	newSpecies = function() {
		var topFitness = 0, // the max fitness of genomes in the species
		staleness = 0, // ??!
		genomes = [], // array of genome
		averageRank = 0, // average of fitness in the species
		computeAverageRank = function() {
			/* compute average rank of the species*/
			var total = 0;
			genomes.forEach(function(genome) {
				total += genome.getGlobalRank();
			});
			averageRank = total / genomes.length;
		},
		breedChild = function() {
			/* crossover two genome in the species and 
			 * return the new genome */
			var child, g, gP;
			g = genomes[randomInteger(0,genomes.length)];
			if (Math.random() < crossoverChance) {
				gP = genomes[randomInteger(0,genomes.length)];
				if (g.getFitness() > gP.getFitness()) {
					child = g.copy();
					child.crossover(gP);
				} else {
					child = gP.copy();
					child.crossover(g);
				}
			} else {
				child = g.copy();
			}

			child.mutate();
			return child;
		};

		return Object.freeze({
			topFitness : topFitness,
			staleness : staleness,
			genomes : genomes,
			averageRank : averageRank,
			computeAverageRank : computeAverageRank,
			breedChild : breedChild
		});
	},
	addToSpecies = function(child) {
		/* add a genome in the population by placing it
		 * in the right species or create a new one */
		var inSpecies = false,
		childSpecies;

		species.forEach(function(specie) {
			if (!inSpecies && child.sameSpecies(specie.genomes[0])) {
				specie.genomes.push(child);
				inSpecies = true;
			}
		});
		if (!inSpecies) {
			childSpecies = newSpecies();
			childSpecies.genomes.push(child);
			species.push(childSpecies);
		}
	},
	currentSpecies = 0, // index of the species in use
	currentGenome = 0, // index of the genome in use in its species
	evaluateCurrentGenome = function(inputs) {
		/* evaluate the network of the current genome given inputs */
		return species[currentSpecies].genomes[currentGenome].evaluateNetwork(inputs);
	},
	setFitnessOfCurrentGenome = function(fitness) {
		/* set the fitness of the current genome */
		var specie = species[currentSpecies];
		specie.genomes[currentGenome].setFitness(fitness);
		if (fitness > specie.topFitness) {
			specie.topFitness = fitness;
			if (fitness > maxFitness) {
				maxFitness = fitness;
			}
		}
	},
	cullSpecies = function(cutToOne) {
		/* cut half of the species or all but one genome 
		 * of the species */
		var remaining;
		species.forEach(function(specie) {
			specie.genomes.sort(function(a,b) {
				return (a.getFitness() < b.getFitness);
			});
			remaining = Math.ceil(specie.genomes.length/2);
			if (cutToOne) {
				remaining = 1;
			}
			while (specie.genomes.length > remaining) {
				specie.genomes.pop();
			}
		});
	},
	rankGlobally = function() {
		/* rank each genome globally */
		var global = [],
		count;

		species.forEach(function(species) {
			species.genomes.forEach(function(genome) {
				global.push(genome);
			});
		});

		global.sort(function(a,b) {
			return (a.getFitness() < b.getFitness());
		});

		count = 0;
		global.forEach(function(genome) {
			genome.setGlobalRank(count);
			count++;
		});
	},
	removeStaleSpecies = function() {
		/* remove species that doesn't evolve enough considering
		 * staleSpecies integer 
		 * but keep species that have the maxFitness */
		var survived = [];
		species.forEach(function (species) {
			species.genomes.sort(function (a,b) {
				return (a.getFitness() < b.getFitness);
			});
			if (species.genomes[0].getFitness() > species.topFitness) {
				species.topFitness = species.genomes[0].getFitness();
				species.staleness = 0;
			} else {
				species.staleness++;
			}
			if (species.staleness < staleSpecies 
					|| species.topFitness >= maxFitness) {
				survived.push(species);
			}
		});

		species = survived;
	},
	totalAverageRank = function() {
		/* return the average of all species average rank */
		/* seems very useless */
		var total = 0;
		species.forEach(function(species) {
			total += species.averageRank;
		});
		return total / species.length;
	},
	removeWeakSpecies = function() {
		/* remove species that averageRank above average of species average rank*/
		var breed,
		survived = [],
		avg = totalAverageRank();
		species.forEach(function(species) {
			breed = species.averageRank - avg;
			if (breed < 0) {
				survived.push(species);
			}
		});
		species = survived;
	},
	resetAllFitness = function() {
		/* reset to  the fitness of all species 
		 * use when changing the fitness evaluation 
		 * for exaple */
		species.forEach(function (specie) {
			specie.genomes.forEach(function (genome) {
				genome.setFitness(0);
			});
			specie.topFitness = 0;
		});
		maxFitness = 0;
	},
	generation = 0,
	newGeneration = function() {
		/* create a new generation of genome  */
		var avg,children,randomSpecies,breed,i;

		cullSpecies(false);
		removeStaleSpecies();

		rankGlobally();
		species.forEach(function(specie) {
			specie.computeAverageRank();
		});
		removeWeakSpecies();

		avg = totalAverageRank();
		children = [];
		species.forEach(function(specie) {
			breed = Math.floor(avg / specie.averageRank)-1;
			for (i=0; i<breed; i++) {
				children.push(specie.breedChild());
			}
		});
		cullSpecies(true);
		while (children.length + species.length < population) {
			randomSpecies = species[randomInteger(0,species.population)];
			children.push(randomSpecies.breedChild());
		}
		children.forEach(function(child) {
			addToSpecies(child);
		});

		species.forEach(function (specie) {
			specie.genomes.forEach(function (genome) {
				genome.setFitness(0);
			});
			specie.topFitness = 0;
		});

		generation++;
	},
	setCurrentGenomeNextOne = function() {
		/* set the current genome the next one 
		 * and create a new generation of genome 
		 * if no next */
		if (currentGenome < (species[currentSpecies].length-1)) {
			currentGenome++;
		} else if (currentSpecies < (species[currentSpecies].length-1)) {
			currentGenome = 0;
			currentSpecies++;
		} else {
			newGeneration();
			currentGenome = 0;
			currentSpecies = 0;
		}
	},
	setCurrentGenomeFirstOne = function() {
		/* set the current genome the first genome 
		 * of the first species
		 * use when changing the fitness evaluation 
		 * for example */
		currentGenome = 0;
		currentSpecies = 0;
	},
	getGeneration = function() {
		/* return the number of the generation */
		return generation;
	},
	getFitnessOfCurrentGenome = function() {
		/* return the fitness of the current genome */
		return species[currentSpecies].genomes[currentGenome].getFitness();
	},
	exportSigmaCurrent = function() {
		/* export in a sigma's graph the network of the
		 * current genome */
		return species[currentSpecies].genomes[currentGenome].exportSigma();
	},
	save = function() {
		/* save the pool */
	},
	i;

	/* initialize the population */
	for (i=0; i<population; i++) {
		addToSpecies(createGenome());
	}

	/* return the pool object */
	return Object.freeze({
		/* public method */
		save : save,
		evaluateCurrentGenome : evaluateCurrentGenome,
		setFitnessOfCurrentGenome : setFitnessOfCurrentGenome,
		setCurrentGenomeNextOne : setCurrentGenomeNextOne,
		setCurrentGenomeFirstOne : setCurrentGenomeFirstOne,
		getFitnessOfCurrentGenome : getFitnessOfCurrentGenome,
		getGeneration : getGeneration,
		exportSigmaCurrent : exportSigmaCurrent,
		resetAllFitness : resetAllFitness,

		/* debug */
		addToSpecies : addToSpecies,
		cullSpecies : cullSpecies,
		rankGlobally : rankGlobally,
		removeStaleSpecies : removeStaleSpecies,
		totalAverageRank : totalAverageRank,
		removeWeakSpecies : removeWeakSpecies,
		resetAllFitness : resetAllFitness,
		newGeneration : newGeneration,
		/* end debug */

	});
}
