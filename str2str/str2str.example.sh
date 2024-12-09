#!/bin/bash

out="ntripc://use:user@:2101/main:exampleCity;rtcm3;1005(10),1008(10),1077(1),1087(1),1097(1),1107(1),1117(1),1127(1),1230(1);3;GPS+GLONASS+Galileo+SBAS+QZSS+BeiDou;;JPN;0.00;0.00;0;0;github.com/symysak/rtk-base-station;NONE;B;N;;#rtcm3"
exec /usr/local/bin/str2str -in serial://ttyACM0:230400#ubx -out "${out}" -out tcpsvr://:2102 -b 1 -p 0.00000000 0.00000000 0.0000 -msg "1005(10),1008(10),1077(1),1087(1),1097(1),1107(1),1117(1),1127(1),1230(1)" -opt -TADJ=1 2> /dev/null