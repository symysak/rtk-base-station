#!/bin/sh

systemctl --user stop container-str2str.service
systemctl --user disable container-str2str.service
systemctl --user stop container-ntrip-caster.service
systemctl --user disable container-ntrip-caster.service
podman rm -f str2str
podman rm -f ntrip-caster