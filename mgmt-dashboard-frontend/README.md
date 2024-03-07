# Web Admin Console for Cockpit
`~/.local/share/cockpit`にソースを入れるとCockpitが自動で認識します。

WSLでの参考コマンド
```
git clone https://github.com/symysak/rtk-base-station
cd rtk-base-station
cd mgmt-dashboard-frontend

mkdir dist
mkdir -p ~/.local/share/cockpit
ln -s `pwd`/dist ~/.local/share/cockpit/rtk-dashboard
npm install
npm run build:watch
code . # vscode立ち上げ
```