#!/bin/sh

username=$(whoami)

echo "version: " $1

podman run -d --name str2str --platform linux/arm64 -l io.containers.autoupdate=registry -l PODMAN_SYSTEMD_UNIT=container-str2str.service --group-add keep-groups --device /dev/ttyACM0:/dev/ttyACM0 --net=host --health-cmd="/app/healthcheck.sh" --health-retries=2 --health-interval=4s --mount type=bind,source="/home/$username/rtk-base-station/str2str/entrypoint.sh",target=/config/entrypoint.sh ghcr.io/symysak/str2str:$1
systemctl --user enable container-str2str.service
podman run -d --name ntrip-caster --platform linux/arm64 -l io.containers.autoupdate=registry -l PODMAN_SYSTEMD_UNIT=container-ntrip-caster.service --net=host --health-cmd="curl --http0.9 127.0.0.1:2101" --health-retries=2 --health-interval=4s --mount type=bind,source="/home/$username/rtk-base-station/ntrip-caster/entrypoint.sh",target=/config/entrypoint.sh ghcr.io/symysak/ntrip-caster:$1
systemctl --user enable container-ntrip-caster.service

# Ubuntu 22.04 LTSのpodmanはv3.4で--health-on-failureがサポートされていないので上記で起動する
# ただし、podmanが--health-on-failureをサポートしているversionの場合は
# --health-on-failure=kill を指定する