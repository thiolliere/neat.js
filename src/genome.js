function createGenomeConstrutor(spec) {
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
	newInnovation = spec.newInnovation,
	deltaDisjoint = spec.deltaDisjoint,
	deltaWeights = spec.deltaWeights,
	deltaThreshold = spec.deltaThreshold;
	display = {
		line : spec.display.line,
		column : spec.display.column,
		bps : spec.display.bps,
	};

	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	function randomInteger(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	function sigmoid(x) {
		return 1/(1+Math.exp(-x));
		//return 2/(1+math.exp(-4.9*x))-1
	}


	function createGenome(spec) {
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
		},
		maxneuron = numberOfInputs;

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
					connections : spec.mutationRates.connections,
					link : spec.mutationRates.link,
					node : spec.mutationRates.node,
					enable : spec.mutationRates.enable,
					disable : spec.mutationRates.disable,
					bias : spec.mutationRates.bias,
					stepSize : spec.mutationRates.stepSize
				};
			}
			maxneuron = spec.maxneuron; // cursor representing the index of the max inner neuron, it can be calculated from genes.into et genes.out and also can be not use ... if I wanted to make a better implementation
		}
		var fitness = 0,
		//innovation = 0, seem not to be used
		setFitness = function(num) {
			fitness = num;
		},
		getFitness = function() {
			return fitness;
		},
		//adjustedFitness seem not to be used
		newNeuron = function() {
			return {
				incoming : [],
				value : 0.0,
			};
		},
		network = {},
		topologicalOrder = [],
		generateNetwork = function() {
			//TODO with outcoming and topological order
			//topological order is an array of layer which is an array of neuron
			network = {};

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
					network[gene.out].incoming.push(gene);
					if (network[gene.into] === undefined) {
						network[gene.into] = newNeuron();
					}
				}
			});
		},
		evaluateNetwork = function(inputs) {
			var i, sum, neuron,outputs = [];
			inputs.push(1);

			for (i=0; i<numberOfInputs; i++) {
				network[i].value = inputs[i];
			}

			/* the order is not guaranted */
			/* must be change to a true graph with node
			 * updated while mutating and an topological sort */
			/* or just for now use an array topologicalOrder
			 * that point on neuron in the right order */
			/* the topological Order may not conatin inuputs */
			Object.keys(network).forEach(function(key) {
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
			return createGenome({
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
			var neuron = {}, i, o, keys, result;
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
			keys = Object.keys(neuron);

			if (notInput) {
				do {
					result = parseInt(keys[randomInteger(0,keys.length)],10);
				} while (result < numberOfInputs);
				return result;
			}
			return parseInt(keys[randomInteger(0,keys.length)],10);
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
			var result = false;
			genes.forEach(function(gene) {
				if (gene.into === link.into && gene.out === link.out) {
					result = true;
				}
			});
			return result;
		},
		linkMutate = function(forceBias) {
			var neuron1 = randomNeuron(false),
			neuron2 = randomNeuron(true),
			tmp, newLink;

			if ((neuron1 < numberOfInputs && neuron2 < numberOfInputs)
				|| neuron1 === neuron2) {
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

			var gene = genes[randomInteger(0,genes.length)];

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
				innovation : newInnovation()
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
				gene = candidates[randomInteger(0,candidates.length)];
				gene.enabled = !gene.enabled;
			}
		},

		mutate = function() {
			Object.keys(mutationRates).forEach(function(key) {
				mutationRates[key] *= (0.95 + randomInteger(0,2)*0.10263); 
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
			var result = false;
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					result = true;
				}
			});
			return result;
		}, 
		getInnovations = function() {
			var array = [];
			genes.forEach(function(gene) {
				array.push(gene.innovation);
			});
			return array;
		},
		copyInnovation = function(innovation) {
			var result;
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					result = {
						out : gene.out,
						into : gene.into,
						weight : gene.weight,
						enabled : gene.enabled,
						innovation : gene.innovation
					};
				}
			});
			return result;
		},
		getWeightOfInnovation = function(innovation) {
			var result;
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					result = gene.weight;
				}
			});
			return result;
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
				if (randomInteger(0,2) === 1 && geneP !== undefined && geneP.enabled) {
					childGenes.push(geneP);
				} else {
					childGenes.push(gene); // it must be copied be the constructor
				}
			});
			return createGenome({
				genes : genes,
				maxneuron : Math.max(maxneuron, genomeP.getMaxneuron()),
				mutationRates : mutationRates
			});
		},
		exportSigma = function() {
			var sig = {
				nodes : [],
				edges : [],
			},
			c;
			Object.keys(network).forEach(function(key) {
				c = Math.floor(network[key].value*16).toString(16);
				sig.nodes.push({
					id : key,
					incoming : network[key].incoming.length, // for topological sort
					x : Math.random(),
					y : Math.random(),
					color : '#'+c+c+'0',
					size : 1,
				});
			});

			genes.forEach(function(gene) {
				if (!gene.enabled) {
					c = '#111'
				} else if (gene.weight>0) {
					c = '#f00';
				} else {
					c = '#00f';
				}
				sig.edges.push({
					id : 'innovation : '+gene.innovation.toString(10)+', weight : '+gene.weight.toString(10),
					source : gene.into.toString(10),
					target : gene.out.toString(10),
					size : Math.abs(gene.weight),
					color : c
				});
			});

//			/* topological sort */
//			var t = {}, toDecrease = [],toDelete = [],i,n;
//			t.buffer = sig.nodes.splice(0,numberOfInputs);
//			t.toOrder = sig.nodes;
//			t.ordered = [];
//			t.edges = sig.edges;
//
//			var layer = 0,
//			notNextLayer = t.buffer.length;
//			while (t.buffer.length > 0) {
//				n = t.buffer.splice(0,1);
//				n.layer = layer;
//				t.ordered.push(n);
//
//				if (!notNextLayer) {
//					notNextLayer = t.buffer.length;
//					layer++;
//				} else {
//					notNextLayer--;
//				}
//				t.edges.forEach(function(edge) {
//					if (edge.source === n.id) {
//						toDecrease.push(edge.target);
//						toDelete.push(edge);
//					}
//				});
//				toDelete.forEach(function(edge) {
//					t.edges.slice(t.edges.indexOf(edge));
//				});
//				toDelete = [];
//				toDecrease.forEach(function(node) {
//					t.toOrder[t.toOrder.indexOf(node)].incoming--;
//				});
//				toDecrease = [];
//				for (i=0; i<t.toOrder.length; i++) {
//					if (t.toOrder[i].incoming.length === 0) {
//						t.buffer.push(t.toOrder[i]);
//						t.toOrder.splice(i,1);
//						i--;
//					}
//				}
//			}
//
//			sig.node = t.ordered;
//
//			sig.node.forEach(function(node) {
//				node.x = node.layer*10;
//			});
//
			return sig;
		},
		save;

		/* return object */
		return Object.freeze({
			/* main method */
			save : save,
			exportSigma : exportSigma,
			mutate : mutate,
			setFitness : setFitness,
			getFitness : getFitness,
			getGlobalRank : getGlobalRank,
			setGlobalRank : setGlobalRank,
			evaluateNetwork : evaluateNetwork,
			generateNetwork : generateNetwork,
			copy : copy,
			sameSpecies : sameSpecies,
			crossover : crossover,

			/* other method used by genome to
			 * proceed with other genome mainly*/
			hasInnovation : hasInnovation,
			getInnovations : getInnovations,
			copyInnovation : copyInnovation,
			getMaxneuron : getMaxneuron,
			getWeightOfInnovation : getWeightOfInnovation,

			/* all attribute *\/
			perturbChance : spec.perturbChance,
			mutateConnectionsChances : spec.mutateConnectionsChances,
			linkMutationChance : spec.linkMutationChance,
			nodeMutationChance : spec.nodeMutationChance,
			enableMutationChance : spec.enableMutationChance,
			disableMutationChance : spec.disableMutationChance,
			biasMutationChance : spec.biasMutationChance,
			stepSize : spec.stepSize,
			numberOfInputs : spec.numberOfInputs,
			numberOfOuputs : spec.numberOfOuputs,
			maxNodes : spec.maxNodes,
			newInnovation : spec.newInnovation,
			deltaDisjoint : spec.deltaDisjoint,
			deltaWeights : spec.deltaWeights,
			deltaThreshold : spec.deltaThreshold,

			randomInteger : randomInteger,
			sigmoid : sigmoid,
			genes : genes,
			mutationRates : mutationRates,
			maxneuron : maxneuron,
			fitness : fitness,
			setFitness : setFitness,
			getFitness : getFitness,
			newNeuron : newNeuron,
			network : network,
			generateNetwork : generateNetwork,
			evaluateNetwork : evaluateNetwork,
			globalRank : globalRank,
			setGlobalRank : setGlobalRank,
			getGlobalRank : getGlobalRank,
			copy : copy,
			pointMutate : pointMutate,
			randomNeuron : randomNeuron,
			newGene : newGene,
			containsLink : containsLink,
			linkMutate : linkMutate,
			nodeMutate : nodeMutate,
			enableDisableMutate : enableDisableMutate,,
			mutate : mutate,
			hasInnovation : hasInnovation,
			getInnovations : getInnovations,
			copyInnovation : copyInnovation,
			getWeightOfInnovation : getWeightOfInnovation,
			disjoint : disjoint,
			weights : weights,
			sameSpecies : sameSpecies,
			crossover : crossover,
			exportSigma : exportSigma,
			save : save,
			/**/
		});
	}
	return createGenome;
}
