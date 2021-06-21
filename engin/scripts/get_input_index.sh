#!/bin/bash

# This script will get the index for the input based on the pid of the process
# that initiated the sound in this case chrome

output=`pacmd list-sink-inputs |
awk -v pid=$1 '
$1 == "index:" {idx = $2}
$1 == "application.process.id" && $3 == "\"" pid "\"" {print idx}
'`

echo $output
