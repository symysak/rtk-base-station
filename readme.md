# RTK base station
```.
├── str2str         # RTKLIB str2str docker image
├── ntrip-caster    # ntrip caster docker image
├── mgmt-cli        # CLI tool for management of configuration files
├── mgmt-dashboard  # Web Dashboard for Cockpit
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
# raspberrypiの場所はユーザ名を入れる
sudo loginctl enable-linger raspberrypi

# install cockpit
. /etc/os-release
sudo apt install -y -t ${VERSION_CODENAME}-backports cockpit cockpit-pcp
sudo systemctl enable --now cockpit.socket

# install podman
sudo apt-get -y install podman

systemctl --user daemon-reload
systemctl --user enable --now podman.socket


# install cockpit-podman
sudo apt install -y cockpit-podman

# git clone
sudo apt install -y git
cd ~
git clone https://github.com/symysak/rtk-base-station.git

sudo cp rtk-base-station/99-zed-f9p.rules /etc/udev/rules.d/
sudo stty -F /dev/ttyACM0 230400

## run containers
cd rtk-base-station

# ntrip casterの設定
cp ntrip-caster/entrypoint.example.sh ntrip-caster/entrypoint.sh
sudo chmod +x ntrip-caster/entrypoint.sh

# str2strの設定
cp str2str/entrypoint.example.sh str2str/entrypoint.sh
sudo chmod +x str2str/entrypoint.sh

chmod +x run_containers.sh
./run_containers.sh <バージョン>
# e.g ./run_containers.sh 1.0.0
# 初回インストール時はsystemdのファイルが無いと言われますが、無視してください

podman generate systemd -f --new --restart-policy always --name str2str
podman generate systemd -f --new --restart-policy always --name ntrip-caster
mv container-str2str.service ~/.config/systemd/user/
mv container-ntrip-caster.service ~/.config/systemd/user/

sed -i '/\[Unit\]/{a\
StartLimitInterval=10s
a\
StartLimitBurst=20
}' ~/.config/systemd/user/container-str2str.service

sed -i '/\[Service\]/{a\
RestartSec=1s
}' ~/.config/systemd/user/container-str2str.service


sed -i '/\[Unit\]/{a\
StartLimitInterval=10s
a\
StartLimitBurst=20
}' ~/.config/systemd/user/container-ntrip-caster.service

sed -i '/\[Service\]/{a\
RestartSec=1s
}' ~/.config/systemd/user/container-ntrip-caster.service


systemctl --user daemon-reload
systemctl --user enable container-str2str.service
systemctl --user enable container-ntrip-caster.service
systemctl --user start container-str2str.service
systemctl --user start container-ntrip-caster.service

# mgmt-cliのビルド
# goのインストール(公式doc通り)
wget https://go.dev/dl/go1.22.0.linux-arm64.tar.gz -P ~/
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf ~/go1.22.0.linux-arm64.tar.gz
/usr/local/go/bin/go version
# mgmt-cliの依存関係をインストール
sudo apt install gpsd gpsd-clients -y

cd mgmt-cli
/usr/local/go/bin/go build -o mgmt-cli
sudo chmod +x mgmt-cli
cd ..

# configファイルの設定
cp config/new-config.example.json config/new-config.json
cp config/running-config.example.json config/running-config.json


# ufwをfirewalldにする
sudo apt install -y firewalld
sudo systemctl disable ufw
sudo systemctl stop ufw
sudo systemctl enable --now firewalld


# optional
sudo apt install -y raspi-config
sudo raspi-config
# fanの設定などをする

# tailscaleの設定を行う
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-exit-node
sudo tailscale set --auto-update

sudo mkdir /etc/systemd/system/tailscaled.service.d
sudo tee /etc/systemd/system/tailscaled.service.d/override.conf <<EOF
[Unit]
After=wg-quick@wg0.service
EOF

sudo systemctl daemon-reload
sudo systemctl restart tailscaled

# wireguardの設定を行う
sudo apt install -y wireguard
wg genkey | sudo tee /etc/wireguard/client.key
sudo cat /etc/wireguard/client.key | wg pubkey | sudo tee /etc/wireguard/client.pub

# 下にwireguardの参考configあり。それを参考にconfigを作成してください
# 作成したconfigを/etc/wireguard/wg0.confに配置したら続きを実行してください

sudo systemctl enable --now wg-quick@wg0


# firewalld の設定
sudo tee /etc/firewalld/services/str2str.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>str2str</short>
  <description>2102/tcp</description>
  <port protocol="tcp" port="2102"/>
</service>
EOF

sudo tee /etc/firewalld/services/ntrip-caster.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>ntrip-caster</short>
  <description>2101/tcp</description>
  <port protocol="tcp" port="2101"/>
</service>
EOF

sudo firewall-cmd --reload

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

# web guiのインストール
git config --global http.postBuffer 524288000
git config --global core.compression 0
git submodule update -i
cd mgmt-dashboard-frontend
mkdir dist
mkdir -p ~/.local/share/cockpit
ln -s `pwd`/dist ~/.local/share/cockpit/rtk-dashboard
sudo apt install nodejs npm -y
sudo npm install n -g
sudo n lts
sudo apt purge nodejs npm -y
npm install
npm run build
cd ..
mgmt-cli/mgmt-cli -c config/ commit -s str2str/ -n ntrip-caster/

sudo reboot

```
## Update
```
cd ~/rtk-base-station

chmod +x rm_containers.sh
./rm_containers.sh

git pull

# ntrip casterの設定
cp ntrip-caster/entrypoint.example.sh ntrip-caster/entrypoint.sh
sudo chmod +x ntrip-caster/entrypoint.sh

# str2strの設定
cp str2str/entrypoint.example.sh str2str/entrypoint.sh
sudo chmod +x str2str/entrypoint.sh

## run containers
chmod +x run_containers.sh
./run_containers.sh <バージョン>
# e.g ./run_containers.sh 1.0.0

podman generate systemd -f --new --restart-policy always --name str2str
podman generate systemd -f --new --restart-policy always --name ntrip-caster
mv container-str2str.service ~/.config/systemd/user/
mv container-ntrip-caster.service ~/.config/systemd/user/

sed -i '/\[Unit\]/{a\
StartLimitInterval=10s
a\
StartLimitBurst=20
}' ~/.config/systemd/user/container-str2str.service

sed -i '/\[Service\]/{a\
RestartSec=1s
}' ~/.config/systemd/user/container-str2str.service


sed -i '/\[Unit\]/{a\
StartLimitInterval=10s
a\
StartLimitBurst=20
}' ~/.config/systemd/user/container-ntrip-caster.service

sed -i '/\[Service\]/{a\
RestartSec=1s
}' ~/.config/systemd/user/container-ntrip-caster.service


systemctl --user daemon-reload
systemctl --user enable container-str2str.service
systemctl --user enable container-ntrip-caster.service
systemctl --user start container-str2str.service
systemctl --user start container-ntrip-caster.service


# mgmt-cliのビルド
cd mgmt-cli
/usr/local/go/bin/go build -o mgmt-cli
sudo chmod +x mgmt-cli
cd ..

# configファイルに破壊的変更がある場合
# configファイルの設定
cp config/new-config.example.json config/new-config.json
cp config/running-config.example.json config/running-config.json

```
### ZED-F9Pの設定
#### 
## Usage
設定画面: https://[ip-address]:9090 (cockpitを使用)

## 説明
GitHubに何かしらの変更があると、自動でコンテナのビルドを行います。
コンテナのビルドが終わると、podmanのauto-updateによって基地局側のコンテナも最新になります。
また、コンテナイメージのタグは、developが開発環境です。
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
git flowに従う
releaseも開発にキリが付いたら行う
### releaseの時のコマンド
```
git tag -a v2.2.0 -m "v2.2.0"
git push origin v2.2.0

// tagの削除
git tag -d v2.2.0
git push origin --delete v2.2.0
```
### wireguard config
```
[Interface]
PrivateKey = 
Address = 
MTU = 

[Peer]
PublicKey = 
AllowedIPs = 0.0.0.0/0
Endpoint = 
PersistentKeepalive = 1
```

## Lisence
### RTKLIB
```
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
```
### patternfly
```
MIT License

Copyright (c) 2019 Red Hat, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```