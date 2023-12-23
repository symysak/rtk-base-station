# RTK base station
```.
├── str2str         # RTKLIB str2str docker image
├── ntrip-caster    # ntrip caster docker image
├── sync-docker-compose # to sync docker-compose with github
└── README.md
```

## Installations
```
sudo apt update
sudo apt upgrade -y

# install cockpit
sudo apt install -y git ${VERSION_CODENAME}-backports cockpit cockpit-pcp

# git clone
git clone https://github.com/symysak/rtk-base-station.git

sudo cp rtk-base-station/99-zed-f9p.rules /etc/udev/rules.d/
sudo stty -F /dev/ttyACM0 230400

# install sync-docker-compose
cd rtk-base-station/sync-docker-compose
sudo cp sync-docker-compose.service /etc/systemd/system/
sudo cp sync-docker-compose.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sync-docker-compose.timer
cd ..

# run docker-compose
sudo docker compose up -d

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