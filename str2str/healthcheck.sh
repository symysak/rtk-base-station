#!/bin/bash

COMMAND="timeout 1 nc -w 1 127.0.0.1 2102"

output=$(eval "$COMMAND" 2>&1)

if [ -n "$output" ]; then
    exit 0
else
    exit 1
fi