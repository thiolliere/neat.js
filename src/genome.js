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
	newInnovation = spec.newInnovation,
	deltaDisjoint = spec.deltaDisjoint,
	deltaWeights = spec.deltaWeights,
	deltaThreshold = spec.deltaThreshold;
//	display = {
//		line : spec.display.line,
//		column : spec.display.column,
//		bps : spec.display.bps,
//	};

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
		/* set attribut and method */
		var mutationRates = {
			connections : mutateConnectionsChances,
			link : linkMutationChance,
			node : nodeMutationChance,
			enable : enableMutationChance,
			disable : disableMutationChance,
			bias : biasMutationChance,
			stepSize : stepSize,
		},
		genes = [], 
		newGene = function() {
			return {
				into : 0, // index of the source in the network
				out : 0, // index of the target in the network
				weight : 0, // weight of the connection
				enabled : true, // whereas the connection is active
				innovation : 0 // keeper used to crossover some genome efficiently
			};
		},
		fitness = 0, // use by the pool to note the genome
		setFitness = function(num) {
			fitness = num;
		},
		getFitness = function() {
			return fitness;
		},
		network = [], // array of node, can be created from genes with generateNetwork
		newNode = function() {
			return {
				incoming : [], // array of referenced to gene in coming
				layer : undefined, // index of the layer in the topological order
				index : undefined, // global index in the top. order
				indexInLayer : undefined, // index in the layer (use to draw)
				outcoming : [], // referenced to gene coming out
				value : undefined, // value taken during the evaluation
			};
		},
		topologicalOrder = [], // referenced to node to evaluate in the right order
		resetTopologicalOrder = function() {
			/* re-set indexs and layers of all node and also reset topologicalOrder */
			var L,S,n,m,layer,nextLayer, index, indexInLayer;
			L = [];
			S = [];

			network.forEach(function(node) {
				if (node.incoming.length === 0) {
					S.push(node);
				}
			});

			network.forEach(function(node) {
				node.marked = 0;
				node.index = -1;
			});

			layer = 0;
			index = 0;
			indexInLayer = 0;
			nextLayer = S.length;
			while (S.length !== 0) {
				n = S[0];
				n.layer = layer;
				n.index = index;
				n.indexInLayer = indexInLayer;
				S.splice(0,1);
				L.push(n);

				n.outcoming.forEach(function(gene) {
					m = network[gene.out];
					m.marked++;
					if (m.marked === m.incoming.length) {
						S.push(m);
					}
				});

				index++;
				indexInLayer++;
				nextLayer--;
				if (nextLayer === 0) {
					nextLayer = S.length;
					indexInLayer = 0;
					layer++;
				}
			}

			Object.keys(network).forEach(function(key) {
				delete network[key].marked;
			});

			topologicalOrder = L;
			topologicalOrder.splice(0,numberOfInputs);
		},
		generateNetwork = function() {
			/* generate the network from the gene, fill incoming and outcoming arrays */
			network = [];

			var i;
			for (i=0; i<numberOfInputs; i++) {
				network.push(newNode());
			}
			for (i=0; i<numberOfOuputs; i++) {
				network.push(newNode());
			}
			genes.forEach(function(gene) {
				if (gene.enabled) {
					if (network[gene.out] === undefined) {
						network[gene.out] = newNode();
					}
					network[gene.out].incoming.push(gene);
					if (network[gene.into] === undefined) {
						network[gene.into] = newNode();
					}
					network[gene.into].outcoming.push(gene);
				}
			});
		},
		evaluateNetwork = function(inputs) {
			/* take an array of inputs and return an array of outputs */
			var i, sum, outputs = [];

			network.forEach(function(node) {
				value = 0;
			});

			for (i=0; i<numberOfInputs; i++) {
				network[i].value = inputs[i];
			}

			topologicalOrder.forEach(function(node) {
				sum = 0;

				node.incoming.forEach(function(gene) {
					sum += gene.weight*network[gene.into].value;
				});
				if (node.incoming.length > 0) {
					node.value = sigmoid(sum);
				} else {
					node.value = 0;
				}
			});

			for (i=numberOfInputs; i<numberOfOuputs+numberOfInputs; i++) {
				outputs.push(network[i].value);
			}
			return outputs;
		},
		globalRank = 0, // use by the pool
		setGlobalRank = function(num) {
			globalRank = num;
		},
		getGlobalRank = function() {
			return globalRank;
		},
		copy = function() {
			return createGenome({
				genes : genes, // must be copied by constructor and not referenced
				mutationRates : mutationRates, // must be copied by constructor and not referenced
			});
		},
		pointMutate = function() {
			/* mutate the weight of genes with randomness */
			var step = mutationRates.stepSize;
			genes.forEach(function(gene) {
				if (Math.random() < perturbChance) {
					gene.weight += Math.random()*step*2 - step;
				} else {
					gene.weight = Math.random()*4 -2;
				}
			});
		},
		choseNodes = function() {
			/* must return two node in the right topological order
			 * and one can be an input whereas the other cannot
			 * also the first node cannot be an output if the second is
			 * not one
			 */
			var node1,node2,tmp,
			isAnOutput = function(n) {
				if (n>=numberOfInputs && n<numberOfInputs+numberOfOuputs) {
					return true;
				}
				return false;
			};
			while (!network[node1] || !network[node1] || node1 === node2
					|| isAnOutput(node1)
					) {
				node1 = randomInteger(0,network.length);
				node2 = randomInteger(numberOfInputs,network.length);
				if (network[node1] && network[node2] &&
						network[node1].layer > network[node2].layer) {
					tmp = node1;
					node1 = node2;
					node2 = tmp;
				}
			}
			return [node1, node2];
		},
		containsLink = function(into,out) {
			/* return if a gene already source on into and target on out */
			var result = false;
			genes.forEach(function(gene) {
				if (gene.into === into && gene.out === out) {
					result = true;
				}
			});
			return result;
		},
		linkMutate = function() { //forceBias WHY ?
			/* create a new link between a node that can be an input
			 * and a node that cannot be an input. also it doesn't create
			 * a link between an output to something other than output
			 */
			var node1,node2,tmp,newLink;
			tmp = choseNodes();
			node1 = tmp[0];
			node2 = tmp[1];

			if (containsLink(node1,node2)) {
				return;
			}


			newLink = newGene();
			newLink.into = node1;
			network[node1].outcoming.push(newLink);
			newLink.out = node2;
			network[node2].incoming.push(newLink);

			newLink.innovation = newInnovation();
			newLink.weight = Math.random()*4 - 2;
			genes.push(newLink);

			resetTopologicalOrder();
		},
		nodeMutate = function() {
			/* disable a random gene and create two genes and 
			 * a node between its source and its target
			 */
			if (!genes.length) {return;}

			var gene = genes[randomInteger(0,genes.length)];

			if (!gene.enabled) {return;}
			gene.enabled = false;

			genes.push({
				out : network.length,
				into : gene.into,
				weight : 1.0,
				enabled : true,
				innovation : newInnovation()
			});
			genes.push({
				out : gene.out,
				into : network.length,
				weight : gene.weight,
				enabled : true,
				innovation : newInnovation()
			});

			generateNetwork(); // can do better
			resetTopologicalOrder();
		},
		enableDisableMutate = function(enable) {
			/* enable a gene that preserve DAG
			 * or disable a gene
			 */
			var candidates = [],
			gene;

			genes.forEach(function(gene) {
				if (gene.enabled !== enable) {
					candidates.push(gene);
				}
			});
			if (candidates.length>0) {
				gene = candidates[randomInteger(0,candidates.length)];
				if (enable) {
					if (network[gene.into].layer < network[gene.out].layer) {
						gene.enabled = !gene.enabled;
					}
				} else {
					gene.enabled = !gene.enabled;
				}
			}
			resetTopologicalOrder();
		},
		mutate = function() {
			/* mutate the genome according mutation rates */
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
			/* return whereas the innovation is present */
			var result = false;
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					result = true;
				}
			});
			return result;
		}, 
		getInnovations = function() {
			/* return an array containing all innovations */
			var array = [];
			genes.forEach(function(gene) {
				array.push(gene.innovation);
			});
			return array;
		},
		copyInnovation = function(innovation) {
			/* copy the gene of a given innovation */
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
			/* return the weight of the gene of a given innovation */
			var result;
			genes.forEach(function(gene) {
				if (gene.innovation === innovation) {
					result = gene.weight;
				}
			});
			return result;
		},
		disjoint = function(genomeP) {
			/* compute the difference of innovations between
			 * this and another genome */
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

			n = innovp.length + genes.length || 1;
			return dis/n;
		},
		weights = function(genomeP) {
			/* compute the average difference of weight between gene 
			 * of same innovation with an other genome */
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

			if (coincident === 0) {
				return 0
			} else {
				return sum / coincident;
			}
		},
		sameSpecies = function(genomeP) {
			/* return if the other genome is considerate the same
			 * species as the present, considering delta specifications */
			var dd = deltaDisjoint*disjoint(genomeP),
			dw = deltaWeights*weights(genomeP);
			return dd + dw < deltaThreshold;
		},
		crossover = function(genomeP) {
			/* breed a new genome result of both the other genome
			 * and this. */
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
				genes : childGenes,
				mutationRates : mutationRates
			});
		},
		exportSigma = function() {
			/* export network and genes into an graph renderable by sigma */
			//console.log("net",network);
			//console.log("genes",genes);
			var sig = {
				nodes : [],
				edges : [],
			},
			c,node;
			Object.keys(network).forEach(function(key) {
				node = network[key];
				if (node.index !== -1) {
					c = 'c'//Math.floor((node.value||0.9)*16).toString(16);
					sig.nodes.push({
						id : key,
						label : 'i'+node.index.toString()+';'+'k'+key,
						x : node.layer*10 || -10,
						y : node.indexInLayer*10 || -10,
						color : '#'+c+c+'0',
						size : 1,
					});
				}
			});

			genes.forEach(function(gene) {
				if (!gene.enabled) {return;}
				if (gene.weight>0) {
					c = '#f00';
				} else {
					c = '#00f';
				}
				sig.edges.push({
					id : gene.innovation.toString(10),
					label : 'innovation : '+gene.innovation.toString(10)+', weight : '+gene.weight.toString(10),
					source : gene.into.toString(10),
					target : gene.out.toString(10),
					size : Math.abs(gene.weight),
					color : c
				});
			});
			return sig;
		},
		save = function() {
			/* save the genome */
		};


		/* parse specifications */
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
		}

		/* generate network and topological order */
		generateNetwork();
		resetTopologicalOrder();

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
			copy : copy,
			sameSpecies : sameSpecies,
			crossover : crossover,

			/* other method used by genome to
			 * proceed with other genome mainly*/
			hasInnovation : hasInnovation,
			getInnovations : getInnovations,
			copyInnovation : copyInnovation,
			getWeightOfInnovation : getWeightOfInnovation,

			/* debug */
			genes : genes,
			network : network,
			globalRank : globalRank,
			fitness : fitness,
			/* end debug */
		});
	}
	return createGenome;
}
