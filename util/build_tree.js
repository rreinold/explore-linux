const DEBUG = false
const NODE_INDICATOR="N"
const CONNECTION_INDICATOR="C"

var input = ""
var added = {}
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if(!input){
  	input = chunk
  }
  else{
  	input += chunk
  }
});
process.stdin.on('end', () => {
	// TODO Remove null char in better way
	var cleanInput = new String(input).replace(/null/g, '')
	transform(new String(cleanInput))
});

function transform(toParse){
	if(!toParse){ console.log("No input. Exitting."); return;}
	var raw = JSON.parse(toParse)
	if (DEBUG) console.log(`Nodes:${raw.n.length}` )
	if (DEBUG) console.log(`Connections:${raw.c.length}` )
	var graph = transformNodes(raw)
	lookupBirthCerts(graph, raw)
	connect(graph, raw)
	if (!DEBUG) print(graph)
	

}

function transformNodes(raw){
	var nodes = {}
	for(i of raw.n){
		if(i["#"] === NODE_INDICATOR){
			nodes[i.Name] = {
				name:i.Namechange2 || i.Namechange || i.Name,
				children:[],
				size:0
			}
		}
	}
	return nodes;
}

function connect(nodes, raw){
	var connections = raw.c

	for(i of connections){
		// parent
		var from = i.From
		// child
		var to = i.To
		if(!to || !from) {
			if (DEBUG) console.log(`Null to:${to} or from:${from} value, i:${JSON.stringify(i)}`)
			continue;
		}
		addConnection(nodes,to,from)

	}
	return nodes;
}

function lookupBirthCerts(nodes,raw){
	for(i of raw.n){
		// parent
		var from = i.Parent
		// child
		var to = i.Name
		if(!to || !from) {
			if (DEBUG) console.log(`Info: Null child:${to} or parent:${from} value, i:${JSON.stringify(i)}`)
			continue;
		}
		if (DEBUG) console.log(`Info: Adding child:${to} or parent:${from} value`)
		addConnection(nodes,to,from)
	}
	return nodes
}

function addConnection(nodes,to,from){

	if( ! nodes[from] ){
		if (DEBUG) console.log(`Tried to connect from ${from} to ${to}, but ${from} not found`)
		return;
	}
	if( ! nodes[to] ){
		if (DEBUG) console.log(`Tried to connect from ${from} to ${to}, but ${to} not found`)
		return
	}
	if( to in added ){
		if (DEBUG) console.log("Node found with multiple parents, skipping: " + to)
			return
	}
	else{
		added[to] = true
	}
	var child = nodes[to]

	nodes[from].children.push(child)
}

function print(graph){


	var rootNode = {name:"root",children:[]}
	var domains = ["Debian","Slackware","Red Hat","Enoch","Arch","Android"].forEach(function(e){
		rootNode.children.push(graph[e])
	})
	if (!DEBUG) console.log(JSON.stringify(rootNode))

}
