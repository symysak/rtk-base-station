# Configuration Management Tools
```
Usage:
  mgmt-cli [flags]
  mgmt-cli [command]

Available Commands:
  commit      Commit changes to the system
  completion  Generate the autocompletion script for the specified shell
  delete      Command to delete a value
  get         Command to get a value from key
  help        Help about any command
  set         Command to set a value
  show        Command to show running configuration

Flags:
  -c, --config-dir string   config file directory ex: mgmt-cli/
  -h, --help                help for mgmt-cli

Use "mgmt-cli [command] --help" for more information about a command.
```
このツールは、設定ファイルの管理、および設定ファイルの適用を行うためのツールである。
rtk-base-stationはこのCLIツールですべての設定行う。

本ツールで特有のワードがあるので、説明をする。
 - key: 設定の項目名
 これは、mgmt-cli/models/config.goに定義されている。
 例えば、"Ntripcaster.Mountpoint"というkeyは、Ntripcaster構造体の中のMountpointを指す。
 また、"Ntripcaster.Sourcetable.Identifier"というような複数の層を持つkeyもある。
 - value: 設定の値
    これは、keyに対応する設定の値である。

## 説明
説明に関しては、ヘルプフラグを付けてコマンドを呼び出すと表示される

ex: `<実行ファイル名> <コマンド名> -h`

追加で説明しておく必要があることについて、以下に説明する。
### 設定の保存場所
実際の設定の保存場所は、rtk-base-station/config直下にあるrunning-config.jsonとnew-config.jsonである。ここで２つの設定ファイルの違いについて説明する。
 - running-config.json: 現在動いている設定が保存されている
 - new-config.json: 適用前の設定が保存されている
 すなわち、適用(commit)を行えば、設定が適用されて、new-config.jsonの内容がrunning-config.jsonにコピーされ、２つは同じ内容になるということである。また、commit時にrunning-config.jsonのバックアップとして、running-config.YYYY-M-D-H-M-S.jsonという名前でバックアップが保存される。
### -cフラグ
これは、設定ファイルのディレクトリのパスを指定するためのフラグである。このフラグは、すべてのコマンドで必須である。
```
pwd
rtk-base-stationのディレクトリのパス
// の場合
<実行ファイル名> <コマンド名> -c rtk-base-stationのディレクトリのパス/config
```
### commitコマンド
これは、設定ファイルの適用を行うことである。イメージ的には、Windowsのコントロールパネルで設定を変更した際に押す必要がある"適用"ボタンがコマンドになったようなものである。
ここでは-nフラグが必須である。これで、ntrip-casterのフォルダのパスを指定する必要がある
```。
pwd
rtk-base-stationのディレクトリのパス
// の場合
<実行ファイル名> commit -c <configディレクトリ> -n rtk-base-stationのディレクトリのパス/ntrip-caster
```

## examples
### keyに設定を投入
```
// Ntripcaster.Mountpointの設定を投入
<実行ファイル名> set Ntripcaster.Mountpoint mountpoint1 -c <configファイル群のディレクトリのパス>
```
### keyの設定を削除
```
// Ntripcaster.Mountpointの設定を削除
<実行ファイル名> delete Ntripcaster.Mountpoint -c <configファイル群のディレクトリのパス>
```
### keyの設定を取得
```
// Ntripcaster.Mountpointの設定を取得
<実行ファイル名> get Ntripcaster.Mountpoint -c <configファイル群のディレクトリのパス>
```
### 設定を適用
```
<実行ファイル名> commit -c <configファイル群のディレクトリのパス> -n <ntrip-casterのフォルダのパス>
```
### すべての設定を表示(configファイルを表示)
```
<実行ファイル名> show -c -c <configファイル群のディレクトリのパス>
```

