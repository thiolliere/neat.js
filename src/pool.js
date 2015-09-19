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
	maxNodes = spec.maxNodes,
	deltaDisjoint = spec.deltaDisjoint,
	deltaWeights = spec.deltaWeights,
	deltaThreshold = spec.deltaThreshold,
	innovation = -1,
	newInnovation = function() {
		innovation++;
		return innovation;
	},
	/* others */
	crossoverChance = spec.crossoverChance,
	staleSpecies = spec.staleSpecies,
	population = spec.population, // assert > 0

	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	randomInteger = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	createGenome = createGenomeConstructor({
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
		deltaThreshold : deltaThreshold
	}),
	species = [],
	maxFitness,
	newSpecies = function() {
		var topFitness = 0,
		staleness = 0,
		genomes = [],
		averageFitness = 0,
		calculateAverageFitness = function() {
			var total = 0;
			genomes.forEach(function(genome) {
				total += genome.getGlobalRank();
			});
			averageFitness = total / genomes.length;
		},
		breedChild = function() {
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
			averageFitness : averageFitness,
			calculateAverageFitness : calculateAverageFitness,
			breedChild : breedChild
		});
	},
	addToSpecies = function(child) {
		var inSpecies = false,
		childSpecies;

		species.forEach(function(specie) {
			if (!inSpecies && child.sameSpecies(specie.genomes[0])) {
				specie.genomes.push(child);
			}
		});
		if (!inSpecies) {
			childSpecies = newSpecies();
			childSpecies.genomes.push(child);
			species.push(childSpecies);
		}
	},
	currentSpecies = 0,
	currentGenome = 0,
	evaluateCurrentGenome = function(inputs) {
		// the network must have been generated
		species[currentSpecies][currentGenome].evaluateNetwork(inputs);
	},
	setFitnessOfCurrentGenome = function(fitness) {
		var specie = species[currentSpecies];
		specie[currentGenome].setFitness(fitness);
		if (fitness > specie.topFitness) {
			specie.topFitness = fitness;
			if (fitness > maxFitness) {
				maxFitness = fitness;
			}
		}
	},
	cullSpecies = function(cutToOne) {
		var remaining;
		species.forEach(function(specie) {
			specie.genomes.sort(function(a,b) {
				return (a.getFitness() > b.getFitness);
			});
			remaining = Math.ceil(specie.genomes.length/2);
			if (cutToOne) {
				remaining = 1;
			}
			while (species.genomes.length > remaining) {
				specie.genomes.pop();
			}
		});
	},
	rankGlobally = function() {
		var global = [],
		count;

		species.forEach(function(species) {
			species.genomes.forEarch(function(genome) {
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
		var survived = [];
		species.forEach(function (species) {
			species.genomes.sort(function (a,b) {
				return (a.getFitness() > b.getFitness);
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
	totalAverageFitness = function() {
		var total = 0;
		species.forEach(function(species) {
			total += species.averageFitness;
		});
		return total;
	},
	removeWeakSpecies = function() {
		var breed,
		survived = [],
		sum = totalAverageFitness();
		species.forEach(function(species) {
			breed = Math.floor(species.averageFitness / sum * population);
			if (breed >= 1) {
				survived.push(species);
			}
		});
		species = survived;
	},
	generation = 0,
	newGeneration = function() {
		var sum,children,randomSpecies,breed,i;

		cullSpecies(false);
		rankGlobally(); //TODO
		removeStaleSpecies(); //TODO
		rankGlobally(); //TODO
		species.forEach(function(specie) {
			specie.calculateAverageFitness();
		});
		removeWeakSpecies(); //TODO

		sum = totalAverageFitness();
		children = [];
		species.forEach(function(specie) {
			breed = Math.floor(specie.averageFitness / sum * population) -1;
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

		species.forEach(function(specie) {
			specie.genomes.forEach(function(genome) {
				genome.generateNetwork();
			});
		});

		generation++;
	},
	setCurrentGenomeNextOne = function() {
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
		currentGenome = 0;
		currentSpecies = 0;
	},
	getGeneration = function() {
		return generation;
	},
	i;

	for (i=0; i<population; i++) {
		addToSpecies(createGenome());
	}
	return Object.freeze({
		/* main method */
		save : save,
		evaluateCurrentGenome : evaluateCurrentGenome,
		setFitnessOfCurrentGenome : setFitnessOfCurrentGenome,
		setCurrentGenomeNextOne : setCurrentGenomeNextOne,
		setCurrentGenomeFirstOne : setCurrentGenomeFirstOne,
		getGeneration : getGeneration,

		/* private attributes
		*/
	});
}
