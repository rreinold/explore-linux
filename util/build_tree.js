const DEBUG = false
const TYPE_COLUMN="field1"
const NAME_COLUMN="field2"
const PARENT_COLUMN="field4"
const RENAME_COLUMN="field9"
// TODO This is actually dynamic
const SECOND_RENAME_COLUMN="field12"

const FROM_COLUMN="field3"
const TO_COLUMN="field5"

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
		if(i[TYPE_COLUMN] === NODE_INDICATOR){
			if (DEBUG) console.log(i[NAME_COLUMN])
			nodes[i[NAME_COLUMN]] = {
				name:i[RENAME_COLUMN] || i[NAME_COLUMN], // TODO Account for second_ rename
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
		var from = i[FROM_COLUMN]
		// child
		var to = i[TO_COLUMN]
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
		var from = i[PARENT_COLUMN]
		// child
		var to = i[NAME_COLUMN]
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
