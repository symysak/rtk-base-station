# Web Admin Console for Cockpit
`~/.local/share/cockpit`にこのフォルダを入れるとCockpitが自動で認識します。

WSLでの参考コマンド
```
git clone https://github.com/symysak/rtk-base-station
cd rtk-base-station
cd mgmt-dashboard-frontend

mkdir -p ~/.local/share/cockpit
ln -s `pwd` ~/.local/share/cockpit/rtk-dashboard
code . # vscode立ち上げ
```