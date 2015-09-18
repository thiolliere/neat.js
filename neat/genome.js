function creteGenomeConstrutor(spec) {
	var perturbChance = spec.perturbChance,
	mutateConnectionsChances = spec.mutateConnectionsChances,
	linkMutationChance = spec.linkMutationChance,
	nodeMutationChance = spec.nodeMutationChance,
	enableMutationChance = spec.enableMutationChance,
	disableMutationChance = spec.disableMutationChance,
	biasMutationChance = spec.biasMutationChance,
	stepSize = spec.stepSize,
	numberOfInputs = spec.numberOfInputs,
	maxNodes = spec.maxNodes,
	numberOfOuputs = spec.numberOfOuputs,
	newInnovation = spec.newInnovation,
	deltaDisjoint = spec.deltaDisjoint,
	deltaWeights = spec.deltaWeights,
	deltaThreshold = spec.deltaThreshold;

	function create(spec) {
		/* set attribut */
		var genes = [],
		mutationRates = {
				connections : mutateConnectionsChances,
				link : linkMutationChance,
				node : nodeMutationChance,
				enable : enableMutationChance,
				disable : disableMutationChance,
				bias : biasMutationChance,
				stepSize : stepSize
		};
		if (spec) {
			if (spec.genes) {
				spec.genes.forEach(function(gene) {
					genes.push({
						into : gene.into,
						out : gene.out,
						weight : gene.weight,
						enabled : gene.enabled,
						innovation : gene.innovation
					});
				});
			}
			if (spec.mutationRates) {
				mutationRates = {
					connections : spec.connections,
					link : spec.link,
					node : spec.node,
					enable : spec.enable,
					disable : spec.disable,
					bias : spec.bias,
					stepSize : spec.stepSize
				};
			}
		}
		var fitness = 0,
		innovation = 0,
		maxneuron = spec.maxneuron || numberOfInputs, // cursor representing the index of the max inner neuron, it can be calculated from genes.into et genes.out
		setFitness = function(num) {
			fitness = num;
		},
		getFitness = function() {
			return fitness;
		},
		//adjustedFitness seem not to be used
		newNeuron = function() {
			return {incoming : [],value : 0.0};
		},
		network = [],
		generateNetwork = function() {
			network = [];

			var i;
			for (i=0; i<numberOfInputs; i++) {
				network[i] = newNeuron();
			}
			for (i=0; i<numberOfOuputs; i++) {
				network[i+maxNodes] = newNeuron();
			}

			genes.sort(function(a,b) {
				return (a.out < b.out);
			});
			genes.forEach(function(gene) {
				if (gene.enabled) {
					if (network[gene.out] === undefined) {
						network[gene.out] = newNeuron();
					}
					network.neurons[gene.out].incoming.push(gene);
					if (network[gene.into] === undefined) {
						network[gene.into] = newNeuron();
					}
				}
			});
		},
		sigmoid = function(x) {
			return 1/(1+Math.exp(-x));
			//return 2/(1+math.exp(-4.9*x))-1
		},
		evaluateNetwork = function(inputs) {
			var i, sum, neuron,outputs = [];
			inputs.push(1);

			for (i=0; i<numberOfInputs; i++) {
				network[i].value = inputs[i];
			}

			Object.key(network).forEach(function(key) {
				sum = 0;
				neuron = network[key];

				neuron.incoming.forEach(function(gene) {
					sum += gene.weight*network[gene.into].value;
				});
				if (neuron.incoming.length > 0) {
					neuron.value = sigmoid(sum);
				}
			});

			for (i=0; i<numberOfOuputs; i++) {
				outputs.push(network[maxNodes+i]);
			}
			return outputs;
		},
		globalRank = 0,
		setGlobalRank = function(num) {
			globalRank = num;
		},
		getGlobalRank = function() {
			return globalRank;
		},
		copy = function() {
			return create({
				genes : genes,
				maxneuron : maxneuron,
				mutationRates : mutationRates, // must be copied by constructor and not referenced
			});
		},
		pointMutate = function() {
			var step = mutationRates.stepsize;
			genes.forEach(function(gene) {
				if (Math.random() < perturbChance) {
					gene.weight += Math.random()*step*2 - step;
				} else {
					gene.weight = Math.random()*4 -2;
				}
			});
		},
		randomNeuron = function(notInput) {
			var neuron = [], i, o, keys, result;
			neuron.length = numberOfInputs;
			for (i=0; i<numberOfInputs; i++) {
				neuron[i] = true;
			}
			for (o=0; o<numberOfOuputs; o++) {
				neuron[o+maxNodes] = true;
			}
			genes.forEach(function(gene) {
				neuron[gene.out] = true;
				neuron[gene.into] = true;
			});
			keys = Object.key(neuron);

			if (notInput) {
				do {
					result = keys[Math.random(0,keys.length)];
				} while (result < numberOfInputs);
				return result;
			}
			return keys[Math.random(0,keys.length)];
		},
		newGene = function() {
			return {
				into : 0,
				out : 0,
				weight : 0,
				enabled : true,
				innovation : 0
			};
		},
		containsLink = function(link) {
			genes.forEach(function(gene) {
				if (gene.into === link.into && gene.out === link.out) {
					return true;
				}
			});
			return false;
		},
		linkMutate = function(forceBias) {
			var neuron1 = randomNeuron(false),
			neuron2 = randomNeuron(true),
			tmp, newLink;

			if (neuron1 < numberOfInputs && neuron2 < numberOfInputs) {
				return;
			}
			if (neuron1 > neuron2) {
				tmp = neuron1;
				neuron1 = neuron2;
				neuron2 = tmp;
			}

			newLink = newGene();
			newLink.into = neuron1;
			newLink.out = neuron2;
			if (forceBias) {
				newLink.into = numberOfInputs - 1; // WHY ?
			}
			if (containsLink(newLink)) {
				return;
			}

			newLink.innovation = newInnovation();
			newLink.weight = Math.random()*4 - 2;
			genes.push(newLink);
		},
		nodeMutate = function() {
			if (!genes.length) {return;}

			var gene = genes[Math.random(0,genes.length)];

			if (!gene.enabled) {return;}
			gene.enabled = false;

			genes.push({
				out : maxneuron,
				into : gene.into,
				weight : 1.0,
				enabled : true,
				innovation : newInnovation()
			});
			genes.push({
				out : gene.out,
				into : maxneuron,
				weight : gene.weight,
				enabled : true,
				innovation : newInnovation
			});

			maxneuron++;
		},
		enableDisableMutate = function(enable) {
			var candidates = [],
			gene;

			genes.forEach(function(gene) {
				if (gene.enabled !== enable) {
					candidates.push(gene);
				}
			});
			if (candidates.length>0) {
				gene = candidates[Math.random(0,candidates.length-1)];
				gene.enabled = !gene.enabled;
			}
		},

		mutate = function() {
			Object.key(mutationRates).forEach(function(key) {
				mutationRates[key] *= (0.95 + Math.random(0,1)*0.10263); 
			});

			if (Math.random() < mutationRates.connections) {
				pointMutate();
			}
			var p = mutationRates.link;
			while (p > 0) {
				if (Math.random() < p) {
					linkMutate(false);
				}
				p--;
			}
			p = mutationRates.bias;
			while (p > 0) {
				if (Math.random() < p) {
					linkMutate(true);
				}
				p--;
			}
			p = mutationRates.node;
			while (p > 0) {
				if (Math.random() < p) {
					nodeMutate();
				}
				p--;
			}
			p = mutationRates.enable;
			while (p > 0) {
				if (Math.random() < p) {
					enableDisableMutate(true);
				}
				p--;
			}
			p = mutationRates.disable;
			while (p > 0) {
				if (Math.random() < p) {
					enableDisableMutate(false);
				}
				p--;
			}
		},
		hasInnovation = function(innovation) {
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					return true;
				}
			});
			return false;
		}, 
		getInnovations = function() {
			var array = [];
			genes.forEach(function(gene) {
				array.push(gene.innovation);
			});
			return array;
		},
		copyInnovation = function() {
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					return {
						out : gene.out,
						into : gene.into,
						weight : gene.weight,
						enabled : gene.enabled,
						innovation : gene.innovation
					};
				}
			});
			return undefined;
		},
		getWeightOfInnovation = function(innovation) {
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					return gene.weight;
				}
			});
			return undefined;
		},
		disjoint = function(genomeP) {
			var dis = 0,
			innovp, n;
			
			genes.forEach(function(gene) {
				if (!genomeP.hasInnovation(gene.innovation)) {
					dis++;
				}
			});

			innovp = genomeP.getInnovations();
			innovp.forEach(function(innovation) {
				if (!hasInnovation(innovation)) {
					dis++;
				}
			});

			n = innovp.length + genes.length;
			return dis/n;
		},
		weights = function(genomeP) {
			var sum = 0,
			coincident = 0,
			weight;
			genes.forEach(function(gene) {
				weight = genomeP.getWeightOfInnovation(gene.innovation);
				if (weight !== undefined) {
					sum += Math.abs(gene.weight - weight);
					coincident++;
				}
			});

			return sum / coincident;
		},
		sameSpecies = function(genomeP) {
			var dd = deltaDisjoint*disjoint(genomeP),
			dw = deltaWeights*weights(genomeP);
			return dd + dw < deltaThreshold;
		},
		getMaxneuron = function() {
			return maxneuron;
		},
		crossover = function(genomeP) {
			var childGenes = [],
			geneP;
			genes.forEach(function(gene) {
				geneP = genomeP.copyInnovation(gene.innovation);
				if (Math.random(2) === 1 && geneP !== undefined && geneP.enabled) {
					childGenes.push(geneP);
				} else {
					childGenes.push(gene); // it must be copied be the constructor
				}
			});
			return create({
				genes : genes,
				maxneuron : Math.max(maxneuron, genomeP.getMaxneuron()),
				mutationRates : mutationRates
			});
		},
		display = function(,
		save;
		
		/* return object */
		return Object.freeze({
			save : save,
			display : display,
			mutate : mutate,
			setFitness : setFitness,
			getFitness : getFitness,
			getGlobalRank : getGlobalRank,
			setGlobalRank : setGlobalRank,
			evaluateNetwork : evaluateNetwork,
			generateNetwork : generateNetwork,
			copy : copy,
			hasInnovation : hasInnovation,
			sameSpecies : sameSpecies,
			getInnovations : getInnovations,
			copyInnovation : copyInnovation,
			getMaxneuron : getMaxneuron,
			getWeightOfInnovation : getWeightOfInnovation,
			crossover : crossover,
		});
	}
	return create;
}
