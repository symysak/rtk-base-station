#!/bin/bash

podman run -d --name str2str --platform linux/arm64 -l io.containers.autoupdate=registry -l PODMAN_SYSTEMD_UNIT=container-str2str.service --group-add keep-groups --device /dev/ttyACM0:/dev/ttyACM0 --net=host ghcr.io/symysak/str2str:latest
systemctl --user enable container-str2str.service
podman run -d --name ntrip-caster --platform linux/arm64 -l io.containers.autoupdate=registry -l PODMAN_SYSTEMD_UNIT=container-ntrip-caster.service --net=host --env-file=/home/raspberrypi/rtk-base-station/.env ghcr.io/symysak/ntrip-caster:latest
systemctl --user enable container-ntrip-caster.service