#!/bin/bash

podman run -d --name str2str --platform linux/arm64 -l io.containers.autoupdate=registry -l PODMAN_SYSTEMD_UNIT=container-str2str.service --group-add keep-groups --device /dev/ttyACM0:/dev/ttyACM0 --net=host --health-cmd="/app/healthcheck.sh" --health-retries=2 --health-interval=4s --health-on-failure=restart ghcr.io/symysak/str2str:latest
systemctl --user enable container-str2str.service
podman run -d --name ntrip-caster --platform linux/arm64 -l io.containers.autoupdate=registry -l PODMAN_SYSTEMD_UNIT=container-ntrip-caster.service --net=host --env-file=/home/raspberrypi/rtk-base-station/.env --health-cmd="curl --http0.9 127.0.0.1:2101" --health-retries=2 --health-interval=4s --health-on-failure=restart ghcr.io/symysak/ntrip-caster:latest
systemctl --user enable container-ntrip-caster.service