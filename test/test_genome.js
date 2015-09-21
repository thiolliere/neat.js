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
	gisableMutationChance : 0.4,
	stepSize : 0.1,
	numberOfInputs : 3,
	numberOfOuputs : 2,
	maxNodes : 10000000,
	newInnovation : createNewInnovation(),
	deltaDisjoint : 2.0,
	deltaWeights : 0.4,
	deltaThreshold : 1.0,
	display : {
		line : 8,
		column : 1,
		bps : 1
	}
});
basic = genomeConstructor();
basic.mutate();
basic.mutate();
basic.generateNetwork();
basic.evaluateNetwork([1,1,0]);
console.log("test constructor");
console.log(basic.exportSigma());

s = new sigma({
	graph : basic.exportSigma(),
	container : 'container',
	settings : {
		maxEdgeSize : 10
	}
});




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
