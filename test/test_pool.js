var createNewInnovation = function() {
	var innovation = -1,
	newInnovation = function() {
		innovation++;
		return innovation;
	};
	return newInnovation;
},
	arg = {
		pertubChance : 0.90,	
		mutationConnetionsChance : 0.25,
		linkMutationChance : 2.0,
		nodeMutationChance : 0.50,
		enableMutationChance : 0.2,
		disableMutationChance : 0.4,
		stepSize : 0.1,
		numberOfInputs : 3,
		numberOfOuputs : 2,
		newInnovation : createNewInnovation(),
		deltaDisjoint : 2.0,
		deltaWeights : 0.4,
		deltaThreshold : 1.0,

		staleSpecies : 15,
		crossoverChance : 0.75,
		population : 6,
	},
	pool = createPool(arg),
	delay=500,
	s = new sigma({
		container : 'container',
		settings : {
			maxEdgeSize : 10
		}
	}),
	one = function() {
		console.log('#1 create pool',pool);
		console.log('----');
		window.setTimeout(two,delay);
	},
	two = function() {
		pool.cullSpecies(false);
		console.log('#2 cull species(false)',pool);
		console.log('----');
		window.setTimeout(three,delay);
	},
	three = function() {
		pool.cullSpecies(true);
		console.log('#3 cull species(true)',pool);
		console.log('----');
		window.setTimeout(four,delay);
	},
	four = function() {
		pool = createPool(arg);
		console.log('#4 setFitness and setCurrentNextOne and rankglobally');
		pool.setFitnessOfCurrentGenome(0);
		for (var i=0; i<arg.population-1; i++) {
			pool.setCurrentGenomeNextOne();
			pool.setFitnessOfCurrentGenome(i*2);
		}
		pool.rankGlobally();
		console.log('species rank : '+pool.getSpecies()[0].genomes[0].getGlobalRank(),' fitness : '+pool.getSpecies()[0].genomes[0].getFitness());
		console.log('species rank : '+pool.getSpecies()[0].genomes[1].getGlobalRank(),' fitness : '+pool.getSpecies()[0].genomes[1].getFitness());
		console.log('species rank : '+pool.getSpecies()[0].genomes[2].getGlobalRank(),' fitness : '+pool.getSpecies()[0].genomes[2].getFitness());
		console.log('species rank : '+pool.getSpecies()[0].genomes[3].getGlobalRank(),' fitness : '+pool.getSpecies()[0].genomes[3].getFitness());
		console.log('species rank : '+pool.getSpecies()[0].genomes[4].getGlobalRank(),' fitness : '+pool.getSpecies()[0].genomes[4].getFitness());
		console.log('species rank : '+pool.getSpecies()[0].genomes[5].getGlobalRank(),' fitness : '+pool.getSpecies()[0].genomes[5].getFitness());
		console.log('pool',pool);
		console.log('getTotalAverageRank',pool.getTotalAverageRank());
		console.log('----');
		window.setTimeout(five,delay);
	},
	five = function() {
		console.log('#5 removeStaleSpecies');
		pool = createPool(arg);

		var b = pool.getSpecies()[0].genomes[0].copy();
		var c = pool.getSpecies()[0].genomes[0].copy();
		b.mutate();
		b.mutate();
		b.mutate();
		b.mutate();
		b.mutate();
		b.mutate();
		b.mutate();
		c.mutate();
		c.mutate();
		c.mutate();
		c.mutate();
		c.mutate();
		c.mutate();
		c.mutate();
		pool.addToSpecies(b);
		pool.addToSpecies(c);
		pool.getSpecies()[1].genomes[0].setFitness(100);
		pool.getSpecies()[1].topFitness=100;
		pool.setMaxFitness(100);
		for (var i=0;i<arg.staleSpecies+2; i++) {
			pool.getSpecies()[0].newTopFitness = true;
			pool.removeStaleSpecies();
			if (i > 11) {
				console.log(i+' : ',pool.getSpecies());
			}
		}
		console.log('----');
		window.setTimeout(six,delay);
	},
	six = function() {
		console.log('#6 breedChild');
		pool = createPool(arg);
		pool.addToSpecies(pool.getSpecies()[0].breedChild());
		pool.addToSpecies(pool.getSpecies()[1].breedChild());
		pool.addToSpecies(pool.getSpecies()[1].breedChild());
		console.log('species : ',pool.getSpecies());

		console.log('----');
		window.setTimeout(seven,delay);
	},
	seven = function() {
		console.log('#7 newGeneration');
		pool = createPool(arg);
		pool.newGeneration();
		console.log('species : ',pool.getSpecies());
		console.log('----');
		window.setTimeout(eight,delay);
	},
	eight = function() {
		var ev;
		console.log('#8 newGeneration + computenetwork');
		pool = createPool(arg);
		for (var i=0; i<arg.population*100; i++) {
			ev = pool.evaluateCurrentGenome([0,0,0]);
			if (isNaN(ev[0]) || isNaN(ev[1])) {
				throw("error");
			}

			pool.setCurrentGenomeNextOne();
		}

		console.log('species : ',pool.getSpecies());
		console.log('----');
		window.setTimeout(nine,delay);
	},
	nine = function() {
	};

one();
