#!/bin/bash

out="${out_stream}/${mountpoint}:${mountpoint};rtcm3.3;${ntrip_msg};${carrer};GPS+GLO+GAL+BDS+QZS;Raspberry Pi;${country};${short_lat};${short_lon};0;0;github.com/symysak/rtk-base-station;NONE;${auth};N;;#rtcm3"

/app/str2str -in tcpcli://localhost:2102#rtcm3 -out "${out}" -p ${lat} ${lon} ${hgt} -msg ${ntrip_msg}