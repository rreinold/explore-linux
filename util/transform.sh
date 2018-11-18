#!/bin/bash

awk '/Nodes/{flag=1;next}/Connectors/{flag=0}flag' gldt.csv | tail -n +2 | csvtojson > c.json
awk '/Nodes/{flag=1;next}/Connectors/{flag=0}flag' gldt.csv | tail -n +2 | csvtojson > n.json

