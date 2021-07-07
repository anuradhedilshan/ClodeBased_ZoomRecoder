#!/bin/bash

pactl list short  sinks | sed 's/[ \t]*\([0-9]\{1,\}\).*/\1/'