# RTK base station
```.
├── str2str         # RTKLIB str2str docker image
├── ntrip-caster    # ntrip caster docker image
├── sync-docker-compose # to sync docker-compose with github
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

# install podman-compose
sudo apt install -y python3-pip
sudo pip3 install podman-compose


# git clone
git clone https://github.com/symysak/rtk-base-station.git

sudo cp rtk-base-station/99-zed-f9p.rules /etc/udev/rules.d/
sudo stty -F /dev/ttyACM0 230400

# install sync-docker-compose
cd rtk-base-station/sync-docker-compose
sudo cp sync-docker-compose.service ~/.config/systemd/user/
sudo cp sync-docker-compose.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now sync-docker-compose.service
systemctl --user enable --now sync-docker-compose.timer
cd ..

# run docker-compose
podman-compose up -d

# enable podman auto-update
podman generate systemd -f --new --name str2str
podman generate systemd -f --new --name ntrip-caster
mv container-str2str.service ~/.config/systemd/user/
mv container-ntrip-caster.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable container-str2str.service
systemctl --user enable container-ntrip-caster.service
sudo loginctl enable-linger
systemctl --user enable --now podman-auto-update.service
systemctl --user enable --now podman-auto-update.timer
sudo vi ~/.config/systemd/user/timers.target.wants/podman-auto-update.timer

# 以下のように変更
#OnCalendar=daily
#RandomizedDelaySec=900
OnUnitActiveSec=1m
## 変更終わり

systemctl --user daemon-reload
systemctl --user restart podman-auto-update.service
systemctl --user restart podman-auto-update.timer

```
## Usage
マウントポイント: main
ユーザ名: なし
パスワード: なし

## 説明
GitHubに何かしらの変更があると、自動でコンテナのビルドを行います。
コンテナのビルドが終わると、基地局側のwatchtowerによって基地局側のコンテナも最新になります。
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
### sync-docker-compose
docker-compose.ymlをgithubから同期するためのものです。
これでGitHubのdocker-compose.ymlを変更すると、自動的に同期されます。