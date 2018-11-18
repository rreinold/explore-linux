#!/bin/bash
set -xe

awk '/Nodes/{flag=1;next}/Connectors/{flag=0}flag' gldt.csv | tail -n +2 | csvtojson --noheader=true > n.json
awk '/Connectors/{flag=1;next}/Domains/{flag=0}flag' gldt.csv | tail -n +2 | csvtojson --noheader=true > c.json
sed '/INSERT_NODES/{
    s/INSERT_NODES//g
    r n.json
}' template.json > intermediate.json
sed '/INSERT_CONNECTIONS/{
    s/INSERT_CONNECTIONS//g
    r c.json
}' intermediate.json > nc.json
cat nc.json | node build_tree.js > ../www/tree.json
