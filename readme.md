# RTK base station
```.
├── str2str         # RTKLIB str2str docker image
├── ntrip-caster    # ntrip caster docker image
├── sync-run-containers-script # to sync docker-compose with github
└── README.md
```

## Installations
### For Raspberry Pi 4b+ (Ubuntu Server 22.04 LTS 64bit)
```
sudo apt update
sudo apt upgrade -y

sudo apt -y install language-pack-ja-base language-pack-ja
sudo localectl set-locale LANG=ja_JP.UTF-8 LANGUAGE="ja_JP:ja"
sudo source /etc/default/locale
sudo loginctl enable-linger raspberrypi

# install cockpit
sudo apt install -y git cockpit cockpit-pcp

# install podman
sudo mkdir -p /etc/apt/keyrings
curl -fsSL "https://download.opensuse.org/repositories/devel:kubic:libcontainers:unstable/xUbuntu_$(lsb_release -rs)/Release.key" \
  | gpg --dearmor \
  | sudo tee /etc/apt/keyrings/devel_kubic_libcontainers_unstable.gpg > /dev/null
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/devel_kubic_libcontainers_unstable.gpg]\
    https://download.opensuse.org/repositories/devel:kubic:libcontainers:unstable/xUbuntu_$(lsb_release -rs)/ /" \
  | sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:unstable.list > /dev/null
sudo apt-get update -qq
sudo apt-get -qq -y install podman

wget https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/xUbuntu_22.04/arm64/conmon_2.1.2~0_arm64.deb
sudo dpkg -i conmon_2.1.2~0_arm64.deb

sudo apt install -y containernetworking-plugins

systemctl --user daemon-reload
systemctl --user enable --now podman.socket


# install cockpit-podman
sudo apt install -y cockpit-podman

# git clone
git clone https://github.com/symysak/rtk-base-station.git

sudo cp rtk-base-station/99-zed-f9p.rules /etc/udev/rules.d/
sudo stty -F /dev/ttyACM0 230400

## run containers
cd rtk-base-station
bash run_containers.sh

# enable podman auto-update
podman generate systemd -f --new --restart-policy always --name str2str
podman generate systemd -f --new --restart-policy always --name ntrip-caster
mv container-str2str.service ~/.config/systemd/user/
mv container-ntrip-caster.service ~/.config/systemd/user/

vi ~/.config/systemd/user/container-str2str.service

[Unit]
# 以下追記
StartLimitInterval=10s
StartLimitBurst=20
# 追記終わり

[Service]
# 以下追記
RestartSec=1s
# 追記終わり

vi ~/.config/systemd/user/container-ntrip-caster.service

[Unit]
# 以下追記
StartLimitInterval=10s
StartLimitBurst=20
# 追記終わり

[Service]
# 以下追記
RestartSec=1s
# 追記終わり

:wq

systemctl --user daemon-reload
systemctl --user enable container-str2str.service
systemctl --user enable container-ntrip-caster.service
systemctl --user start container-str2str.service
systemctl --user start container-ntrip-caster.service

sudo vi ~/.config/systemd/user/timers.target.wants/podman-auto-update.timer

# 以下のように変更
#OnCalendar=daily
#RandomizedDelaySec=900
OnUnitActiveSec=1m
## 変更終わり

systemctl --user daemon-reload
systemctl --user enable --now podman-auto-update.service
systemctl --user enable --now podman-auto-update.timer
systemctl --user restart podman-auto-update.service
systemctl --user restart podman-auto-update.timer

# mgmt-cliのビルド
cd mgmt-cli
go build main.go -o mgmt-cli
sudo chmod +x mgmt-cli
cd ..

# ntrip casterの設定
sudo chmod +x ntrip-caster/entrypoint.sh

# optional ufwをfirewalldにする
sudo systemctl disable ufw
sudo systemctl stop ufw
sudo apt install firewalld
sudo systemctl enable --now firewalld


# optional
sudo apt install -y raspi-config
sudo raspi-config
# fanの設定などをする

sudo reboot

```
## Usage
マウントポイント: main
ユーザ名: なし
パスワード: なし

## 説明
GitHubに何かしらの変更があると、自動でコンテナのビルドを行います。
コンテナのビルドが終わると、podmanのauto-updateによって基地局側のコンテナも最新になります。
```
2101/tcp: ntrip caster
2102/tcp: str2str(後述)
```
### str2str
RTKLIBのstr2strをdocker化したものです。
Windowsにインストールしたu-centerからリモートで設定の変更をするためのもの。
### ntrip-caster
RTKLIBのstr2strをdocker化したものです。
str2strをNTRIP Casterとして動作させています。

## メモ
### git pull後の諸々の反映
```
git pull
bash rm_containers.sh
その後上記instllationの## run containersか
systemctl --user enable --now podman-auto-update.timerまで
実行
```
### firewalld
```
sudo vi /etc/firewalld/services/str2str.xml

<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>str2str</short>
  <description>2102/tcp</description>
  <port protocol="tcp" port="2102"/>
</service>
:wq

sudo vi /etc/firewalld/services/ntrip-caster.xml

<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>ntrip-caster</short>
  <description>2101/tcp</description>
  <port protocol="tcp" port="2101"/>
</service>
:wq

sudo firewall-cmd --reload
sudo firewall-cmd  --get-services

sudo firewall-cmd --new-zone mgmt --permanent
sudo firewall-cmd --reload

sudo firewall-cmd --change-interface wlan0 --zone=mgmt --permanent
sudo firewall-cmd --change-interface eth0 --zone=mgmt --permanent
sudo firewall-cmd --change-interface tailscale0 --zone=mgmt --permanent
sudo firewall-cmd --add-service={cockpit,ssh,str2str,ntrip-caster} --zone=mgmt --permanent
sudo firewall-cmd --reload

sudo firewall-cmd --change-interface wg0 --zone=external --permanent
sudo firewall-cmd --remove-service=ssh --zone=external --permanent
sudo firewall-cmd --add-service=ntrip-caster --zone=external --permanent
sudo firewall-cmd --reload

sudo firewall-cmd --remove-service={cockpit,ssh,dhcpv6-client} --permanent
sudo firewall-cmd --reload
```

## Lisence
### RTKLIB
--------------------------------------------------------------------------------

         Copyright (c) 2007-2020, T. Takasu, All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list
of conditions and the following disclaimer. Redistributions in binary form must
reproduce the above copyright notice, this list of conditions and the following
disclaimer in the documentation and/or other materials provided with the
distribution.

The software package includes some companion executive binaries or shared
libraries necessary to execute APs on Windows. These licenses succeed to the
original ones of these software.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

--------------------------------------------------------------------------------
