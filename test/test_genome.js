var createNewInnovation = function() {
	var innovation = -1,
	newInnovation = function() {
		innovation++;
		return innovation;
	};
	return newInnovation;
}, genomeConstructor = createGenomeConstrutor({
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
}),
	delay=1000,
	s = new sigma({
		container : 'container',
		settings : {
			maxEdgeSize : 10
		}
	}),
	one = function() {
		basic = genomeConstructor();
		//basic.evaluateNetwork([1,1,0]);
		console.log("basic created : fitness="+basic.getFitness()+" globalRank="+basic.getGlobalRank());

		basic.setFitness(40);
		basic.setGlobalRank(2);
		console.log("rank and fitness changed : fitness="+basic.getFitness()+" globalRank="+basic.getGlobalRank());

		s.graph.read(basic.exportSigma());
		s.refresh();

		window.setTimeout(two, delay);
	},
	two = function() {
		console.log("mutate");
		basic.mutate()

		s.graph.clear();
		s.graph.read(basic.exportSigma());
		s.refresh();

		window.setTimeout(three, delay);
	},
	three = function() {
		second = basic.copy();
		console.log("copy in second : same species : "+basic.sameSpecies(second));


		s.graph.clear();
		s.graph.read(second.exportSigma());
		s.refresh();

		window.setTimeout(four, delay);
	},
	four = function() {
		basic.mutate();
		console.log("basic mutate , same species ? : "+basic.sameSpecies(second));

		s.graph.clear();
		s.graph.read(basic.exportSigma());
		s.refresh();

		window.setTimeout(five, delay);
	},
	five = function() {
		third = basic.crossover(second);

		console.log("basic cross second : b+third same ?"+basic.sameSpecies(third)+"  s+third ?"+second.sameSpecies(third));

		s.graph.clear();
		s.graph.read(third.exportSigma());
		s.refresh();
	};

one();













//var mutate = function() {
//	basic.mutate();
//	basic.evaluateNetwork([1,1,0]);
//	console.log("test constructor");
//	console.log(basic.exportSigma());
//}
//
//for (var i=0; i<1; i++) {
//	mutate();
//}


//s.graph.read(basic.exportSigma());
//s.refresh();

/* test private method 
   console.log("test linkMutate");
   basic.linkMutate();
   basic.generateNetwork();
   console.log(basic.exportSigma());

   console.log("test containsLink");
   console.log(basic.containsLink(basic.genes[0]));

   console.log("test nodeMutate");
   basic.nodeMutate();
   basic.generateNetwork();
   console.log(basic.exportSigma());

   console.log("test pointMutate");
   basic.pointMutate();
   basic.generateNetwork();
   console.log(basic.exportSigma());
	/* end test private method */

	/*console.log("test mutate basic");
	  basic.mutate();
	  basic.generateNetwork();
	  console.log("basic : ");
	  console.log(basic.exportSigma());

	  console.log("test copy");
	  other = basic.copy();
	  basic.generateNetwork();
	  other.generateNetwork();
	  console.log("basic : ");
	  console.log(basic.exportSigma());
	  console.log("other : ");
	  console.log(other.exportSigma());

	  var i;
	  for (i = 0; i<10; i++) {
	  console.log("test mutate other");
	  other.mutate();
	  basic.generateNetwork();
	  other.generateNetwork();
	  console.log("basic : ");
	  console.log(basic.exportSigma());
	  console.log("other : ");
	  console.log(other.exportSigma());
	  console.log("same species ?");
	  console.log(basic.sameSpecies(other));
	  }

	  for (i=0; i<10; i++) {
	  console.log("test crossover");
	  basic.crossover(other);
	  basic.generateNetwork();
	  other.generateNetwork();
	  console.log("basic : ");
	  console.log(basic.exportSigma());
	  console.log("other : ");
	  console.log(other.exportSigma());
	  }
	  */
