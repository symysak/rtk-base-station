#!/bin/bash
exec /app/str2str -in serial://ttyACM0:230400 -out tcpsvr://:2102 -b 1 2> /dev/null