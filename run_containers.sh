#!/bin/bash

podman run -d --name str2str --platform linux/arm64 -l io.containers.autoupdate=image --restart unless-stopped --group-add keep-groups --device /dev/ttyACM0:/dev/ttyACM0 --net=host ghcr.io/symysak/str2str:latest

podman run -d --name ntrip-caster --platform linux/arm64 -l io.containers.autoupdate=image --restart unless-stopped --net=host --env-file=.env ghcr.io/symysak/ntrip-caster:latest
