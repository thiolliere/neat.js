# neat.js

javascript implementation of NEAT algorithm.

it is a work in progress, it doesn't work yet

# What is NEAT

NeuroEvolution of Augmenting Topologies (NEAT) is a genetic 
algorithm for the generation of evolving artificial neural 
networks developed by Ken Stanley in 2002

an example of use is [MarI/O](https://www.youtube.com/results?search_query=marI%2FO&page=&utm_source=opensearch). (it uses an other library)

### artificial neural network

The artificial neural network is an algorithm that take inputs
(an array of bit) and return outputs (an array of bit).

for instance, in a 2D computer game, inputs can be an array of
4 bit representing the screen : 
* 0 : void
* 1 : neutral entites such as wall
* 2 : bullet
* 3 : ennemy

and the output is an array of 4 bit, each one for a button.

### genetic algorithm

A neural network is static so to learn we make 
modification on it and chose if the modification is
efficient.

the process is the following :
* it starts from a basic empty neural network and creates
a population of neural networks that are modified version
of the basic.
* then it loops :
  * it evaluates the fitness of each network
  * it kill bad networks and creates a new generation 
of networks by mutating the best ones

# How use it

neat.js file have a the constructor (createNeat) to 
create a neat object.

### create the object 

method : createNeat

the specification are :

* numberOfInputs 									: the length of the array of inputs
* numberOfOuputs									: the length of the array of outputs

* population					[300]				: the length of the population
* deltaDisjoint 				[2.0]
* deltaWeights 					[0.4]
* deltaThreshold 				[1.0]
* staleSpecies 					[15]
* mutateConnectionsChances 		[0.25]
* perturbChance 				[0.90]
* crossoverChance 				[0.75]
* linkMutationChance 			[2.0]
* nodeMutationChance 			[0.50]
* biasMutationChance 			[0.40]
* stepSize						[0.1]
* disableMutationChance 		[0.4]
* enableMutationChance			[0.2]
* display = {
		line : 					[numberOfInputs]
		column : 				[1]
		bps : 					[1]
	};

### game loop

during the life of the network use :
* outputs compute(inputs) : to compute inputs and get outputs

* setFitness : to set the fitness of the network

* getFitness : to get the fitness of the network

* addFitness : to add to the fitness of the network

* evolve : to kill the network and get a new one

also you may use changeFitnessEvaluation when you change 
the way you are evaluating the fitness of networks so
even if the new evaluation is in average higher than the older,
some networks aren't wasted because the were evaluating by the
older.

# How it works 

the implementation is divided in three parts :

### neat.js 
implement an abstract interface to the pool and 
provide default value to parameters.

### pool.js
put genome in species in a pool, at each generation
remove worst genome of each species and worst species,
and create new genome by crossover (mutating together) 
the best ones.

### genome.js
a genome(network) that have method to mutate, to crossover,
and evaluate inputs...
