package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

var validate *validator.Validate

// str2strのディレクトリのパス
var str2strDir string

var debug = os.Getenv("DEBUG") == "true"

// commitCmd represents the commit command
var commitCmd = &cobra.Command{
	Use:   "commit",
	Short: "Commit changes to the system",
	Long:  "Commit changes to the system",

	RunE: func(cmd *cobra.Command, args []string) error {
		//
		// コミット前のチェック
		//
		fmt.Println("Checking...")

		// str2str関連のチェック
		checkStr2Str()

		// running-configとnew-configを読み込む
		raw_running_config, err := os.ReadFile(configDir + "running-config.json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		var running_config models.Config
		json.Unmarshal(raw_running_config, &running_config)

		raw_new_config, err := os.ReadFile(configDir + "new-config.json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		var new_config models.Config
		json.Unmarshal(raw_new_config, &new_config)

		// バリデーションチェック
		validate = validator.New(validator.WithRequiredStructEnabled())
		// navsystemというカスタムバリデーションを登録
		err = validate.RegisterValidation("navsystem", validateNavSystem)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		// generatorというカスタムバリデーションを登録
		err = validate.RegisterValidation("generator", validateGenerator)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		err = validate.Struct(new_config)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}

		// パスワードまたはユーザ名が設定されている場合、両方が設定されているか確認
		if new_config.Ntripcaster.Username != "" || new_config.Ntripcaster.Password != "" {
			var ok1, ok2 bool
			if new_config.Ntripcaster.Username != "" {
				ok1 = true
			}
			if new_config.Ntripcaster.Password != "" {
				ok2 = true
			}
			if ok1 != ok2 {
				fmt.Fprintln(os.Stderr, "Username and Password must be set together")
				os.Exit(1)
			}
		}

		fmt.Println("Check Completed")
		//
		// 諸々のチェックおわり
		//

		//
		// コミット処理
		//
		fmt.Println("Committing...")

		// str2strのcommit処理
		commitStr2str(new_config)

		// UloxReceiverのcommit処理
		commitUbloxReceiver(new_config)

		fmt.Println("Commit Completed")
		//
		// コミット処理おわり
		//

		// コミットが終わったのでconfigDir + running-config.jsonを書き換える
		new_running_config, err := os.Create(configDir + "running-config.json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		defer new_running_config.Close()
		encoder2 := json.NewEncoder(new_running_config)
		encoder2.SetIndent("", "  ")
		if err := encoder2.Encode(new_config); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}

		// もともとのrunning-configを念のため保存しておく
		var date string = strconv.Itoa(time.Now().Year()) + "-" + strconv.Itoa(int(time.Now().Month())) + "-" + strconv.Itoa(time.Now().Day()) + "-" + strconv.Itoa(time.Now().Hour()) + "-" + strconv.Itoa(time.Now().Minute()) + "-" + strconv.Itoa(time.Now().Second())
		fmt.Println("config backed up: " + configDir + "running-config." + date + ".json")
		running_config_bak, err := os.Create(configDir + "running-config." + date + ".json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		defer running_config_bak.Close()
		encoder3 := json.NewEncoder(running_config_bak)
		encoder3.SetIndent("", "  ")
		if err := encoder3.Encode(running_config); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(commitCmd)

	commitCmd.Flags().StringVarP(&str2strDir, "str2str-dir", "s", "", "str2str directory ex: ../str2str/")
	commitCmd.MarkFlagRequired("str2str-dir")
}

func validateNavSystem(fl validator.FieldLevel) bool {
	// 英文字と+のみで構成されているか
	// かつ、+が連続していないか
	// かつ、+で始まっていないか
	// かつ、+で終わっていないか

	if fl.Field().String()[0] == '+' {
		return false
	}
	if fl.Field().String()[len(fl.Field().String())-1] == '+' {
		return false
	}
	for i := 0; i < len(fl.Field().String()); i++ {
		if fl.Field().String()[i] == '+' {
			if i+1 < len(fl.Field().String()) {
				if fl.Field().String()[i+1] == '+' {
					return false
				}
			}
		} else if fl.Field().String()[i] < 'A' || fl.Field().String()[i] > 'Z' {
			if fl.Field().String()[i] < 'a' || fl.Field().String()[i] > 'z' {
				return false
			}
		}
	}
	return true
}

func validateGenerator(fl validator.FieldLevel) bool {
	// 英字と/と-と.のみで構成されているか

	var ValueCheck = regexp.MustCompile("^[0-9a-zA-Z./-]+$").MatchString
	return ValueCheck(fl.Field().String())

}

// str2str関連のチェックを行う関数
func checkStr2Str() {
	// str2strDirの存在確認
	f, err := os.Stat(str2strDir)
	if os.IsNotExist(err) || !f.IsDir() {
		fmt.Fprintln(os.Stderr, str2strDir+" is not exist or not directory")
		os.Exit(1)
	}
	// str2strのconfigが存在するか確認
	f, err = os.Stat(str2strDir + "str2str.sh")
	if os.IsNotExist(err) || f.IsDir() {
		fmt.Fprintln(os.Stderr, str2strDir+"str2str.sh is not exist or directory")
		os.Exit(1)
	}
}

// str2strのcommit処理を行う関数
func commitStr2str(new_config models.Config) {
	var text string
	text += `#!/bin/bash

out="`

	if new_config.Ntripcaster.Username != "" && new_config.Ntripcaster.Password != "" {
		text += "ntripc://"
		text += new_config.Ntripcaster.Username
		text += ":"
		text += new_config.Ntripcaster.Password
		text += "@:2101"
	} else {
		text += "ntripc://:2101"
	}

	text += "/"

	text += new_config.Ntripcaster.Mountpoint + ":"
	text += new_config.Ntripcaster.Sourcetable.Identifier + ";"
	text += new_config.Ntripcaster.Sourcetable.Format + ";"

	var tmp []string
	// 0の場合は何もしない
	tmp = append(tmp, "1005("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1005)+")")

	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1008 != 0 {
		tmp = append(tmp, "1008("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1008)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1077 != 0 {
		tmp = append(tmp, "1077("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1077)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1087 != 0 {
		tmp = append(tmp, "1087("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1087)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1097 != 0 {
		tmp = append(tmp, "1097("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1097)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1107 != 0 {
		tmp = append(tmp, "1107("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1107)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1117 != 0 {
		tmp = append(tmp, "1117("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1117)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1127 != 0 {
		tmp = append(tmp, "1127("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1127)+")")
	}
	if new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1230 != 0 {
		tmp = append(tmp, "1230("+strconv.Itoa(new_config.Ntripcaster.Sourcetable.FormatDetails.Msg1230)+")")
	}
	var msg string
	for i := 0; i < len(tmp); i++ {
		if i == len(tmp)-1 {
			msg += tmp[i]
		} else {
			msg += tmp[i]
			msg += ","
		}
	}
	text += msg

	text += ";"

	text += strconv.Itoa(new_config.Ntripcaster.Sourcetable.Carrer) + ";"
	text += new_config.Ntripcaster.Sourcetable.NavSystem + ";"
	text += new_config.Ntripcaster.Sourcetable.Network + ";"
	text += new_config.Ntripcaster.Sourcetable.Country + ";"
	text += strconv.FormatFloat(new_config.Ntripcaster.Latitude, 'f', 2, 64) + ";"
	text += strconv.FormatFloat(new_config.Ntripcaster.Longitude, 'f', 2, 64) + ";"
	text += strconv.Itoa(new_config.Ntripcaster.Sourcetable.Nmea) + ";"
	text += strconv.Itoa(new_config.Ntripcaster.Sourcetable.Solution) + ";"
	text += new_config.Ntripcaster.Sourcetable.Generator + ";"
	text += new_config.Ntripcaster.Sourcetable.ComprEncryp + ";"
	if new_config.Ntripcaster.Username != "" && new_config.Ntripcaster.Password != "" {
		text += "B" + ";"
	} else {
		text += "N" + ";"
	}
	text += new_config.Ntripcaster.Sourcetable.Fee + ";"
	text += new_config.Ntripcaster.Sourcetable.Bitrate + ";"
	text += new_config.Ntripcaster.Sourcetable.Misc

	text += `#rtcm3"`
	text += `
`
	text += `exec /usr/local/bin/str2str -in serial://ttyACM0:230400#ubx -out "${out}" -out tcpsvr://:2102 -b 1`
	text += " -p "
	text += strconv.FormatFloat(new_config.Ntripcaster.Latitude, 'f', 8, 64) + " "
	text += strconv.FormatFloat(new_config.Ntripcaster.Longitude, 'f', 8, 64) + " "
	text += strconv.FormatFloat(new_config.Ntripcaster.Height, 'f', 4, 64) + " "

	text += `-msg "`
	text += msg
	text += `" -opt -TADJ=1`
	if !new_config.Debug {
		text += " 2> /dev/null"
	}

	f, err := os.Create(str2strDir + "str2str.sh")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer f.Close()
	f.Write(([]byte)(text))

	fmt.Print(".") // ちゃんと処理してますよ感を出す
	// str2strを再起動する

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("systemctl", "--user", "restart", "str2str.service")
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if !debug {
		err = cmd.Run()
		fmt.Print(".") // ちゃんと処理してますよ感を出す
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			fmt.Fprintln(os.Stderr, stderr.String())
			os.Exit(1)
		}
		fmt.Println(stdout.String())
	} else {
		fmt.Println("[DEBUG]: skipped: systemctl --user restart str2str.service")
	}
}

// UbloxReceiverのcommit処理を行う関数
func commitUbloxReceiver(new_config models.Config) {
	fmt.Print(".") // ちゃんと処理してますよ感を出す
	// 作成した配列をforで回して、ubxtoolで設定を行う
	// /dev/ttyACM0はstr2strによって使用されいているので、一旦停止する
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("systemctl", "--user", "stop", "str2str.service")
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if !debug {
		err := cmd.Run()
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			fmt.Fprintln(os.Stderr, stderr.String())
			os.Exit(1)
		}
	} else {
		fmt.Println("[DEBUG]: skipped: systemctl --user stop str2str.service")
	}

	// receiverのPROTVERを取得

	arg := "ubxtool -f /dev/ttyACM0 -p MON-VER | grep PROTVER"
	cmd = exec.Command("bash", "-c", arg)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if !debug {
		err := cmd.Run()
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			fmt.Fprintln(os.Stderr, stderr.String())
			os.Exit(1)
		}
	} else {
		fmt.Println("[DEBUG]: skipped: ubxtool -f /dev/ttyACM0 -p MON-VER | grep PROTVER")
	}

	// "extention PROTVER=XX.XX"という形式で出力されるので、XX.XXの部分だけ取り出す
	var protVer string
	for i := 20; i < len(stdout.String())-1; i++ {
		protVer += string(stdout.String()[i])
	}

	fmt.Print(".") // ちゃんと処理してますよ感を出す
	// 設定の適用前に、コンフリクトが生じないようにレシーバをリセットする
	cmd = exec.Command("ubxtool", "-f", "/dev/ttyACM0", "-w", "1", "-P", protVer, "-p", "RESET")
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if !debug {
		err := cmd.Run()
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			fmt.Fprintln(os.Stderr, stderr.String())
			os.Exit(1)
		}
	} else {
		fmt.Println("[DEBUG]: skipped: ubxtool -f /dev/ttyACM0 -w 1 -P " + protVer + " -p RESET")
	}

	/*
		以下のようなconfig構成
		UbloxReceiver
			SaveConfig
			CFG
				MSGOUT
					NMEA
						ID
							GGA
							GLL
							GSA
							GSV
							RMC
							VTG
					UBX
						NAV
							SAT
							PVT
						RXM
							RAWX
							SFRBX
				SIGNAL
				 	<省略>
	*/
	/*
			設定の適用は以下の手順で行う
			1. Keyと、セットする値を配列で用意する
			   設定に使用するコマンドは、以下の通り
		       	ubxtool -f /dev/ttyACM0 -w 0.5 -P protver -z <Key>,<セットする値>,<LAYER番号>
				LAYER番号は、1がRAM、2がBBR、4がFlash。省略したらすべてのレイヤに適用される
			2. 配列をforで回して、ubxtoolで設定を行う
	*/
	commands := [][]string{}

	boolToString := func(a bool) string {
		if a {
			return "1"
		} else {
			return "0"
		}
	}
	// CFG-MSGOUT-NMEA-ID-*の設定を適用する
	tmp := "CFG-MSGOUT-NMEA_ID_"
	name := ""
	// GGA
	name = "GGA"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GGA.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GGA.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GGA.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GGA.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GGA.USB)})
	// GLL
	name = "GLL"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GLL.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GLL.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GLL.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GLL.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GLL.USB)})
	// GSA
	name = "GSA"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSA.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSA.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSA.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSA.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSA.USB)})
	// GSV
	name = "GSV"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSV.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSV.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSV.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSV.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.GSV.USB)})
	// RMC
	name = "RMC"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.RMC.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.RMC.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.RMC.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.RMC.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.RMC.USB)})
	// VTG
	name = "VTG"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.VTG.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.VTG.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.VTG.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.VTG.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.NMEA.ID.VTG.USB)})

	// CFG-MSGOUT-UBX-NAV-*の設定を適用する
	tmp = "CFG-MSGOUT-UBX_NAV_"
	// SAT
	name = "SAT"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.SAT.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.SAT.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.SAT.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.SAT.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.SAT.USB)})
	// PVT
	name = "PVT"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.PVT.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.PVT.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.PVT.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.PVT.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.NAV.PVT.USB)})

	// CFG-MSGOUT-UBX-RXM-*の設定を適用する
	tmp = "CFG-MSGOUT-UBX_RXM_"
	// RAWX
	name = "RAWX"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.RAWX.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.RAWX.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.RAWX.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.RAWX.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.RAWX.USB)})
	// SFRBX
	name = "SFRBX"
	commands = append(commands, []string{tmp + name + "_I2C", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.SFRBX.I2C)})
	commands = append(commands, []string{tmp + name + "_SPI", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.SFRBX.SPI)})
	commands = append(commands, []string{tmp + name + "_UART1", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.SFRBX.UART1)})
	commands = append(commands, []string{tmp + name + "_UART2", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.SFRBX.UART2)})
	commands = append(commands, []string{tmp + name + "_USB", boolToString(new_config.UbloxReceiver.CFG.MSGOUT.UBX.RXM.SFRBX.USB)})

	// CFG-SIGNAL-*の設定を適用する
	tmp = "CFG-SIGNAL-"
	// GPS
	name = "GPS"
	commands = append(commands, []string{tmp + name + "_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GPS.ENA)})
	commands = append(commands, []string{tmp + name + "_L1CA_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GPS.L1CA_ENA)})
	commands = append(commands, []string{tmp + name + "_L2C_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GPS.L2C_ENA)})
	// SBAS
	name = "SBAS"
	commands = append(commands, []string{tmp + name + "_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.SBAS.ENA)})
	commands = append(commands, []string{tmp + name + "_L1CA_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.SBAS.L1CA_ENA)})
	// GAL
	name = "GAL"
	commands = append(commands, []string{tmp + name + "_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GAL.ENA)})
	commands = append(commands, []string{tmp + name + "_E1_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GAL.E1_ENA)})
	commands = append(commands, []string{tmp + name + "_E5B_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GAL.E5B_ENA)})
	// BDS
	name = "BDS"
	commands = append(commands, []string{tmp + name + "_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.BDS.ENA)})
	commands = append(commands, []string{tmp + name + "_B1_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.BDS.B1_ENA)})
	commands = append(commands, []string{tmp + name + "_B2_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.BDS.B2_ENA)})
	// QZSS
	name = "QZSS"
	commands = append(commands, []string{tmp + name + "_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.QZSS.ENA)})
	commands = append(commands, []string{tmp + name + "_L1CA_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.QZSS.L1CA_ENA)})
	commands = append(commands, []string{tmp + name + "_L1S_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.QZSS.L1S_ENA)})
	commands = append(commands, []string{tmp + name + "_L2C_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.QZSS.L2C_ENA)})
	// GLO
	name = "GLO"
	commands = append(commands, []string{tmp + name + "_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GLO.ENA)})
	commands = append(commands, []string{tmp + name + "_L1_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GLO.L1_ENA)})
	commands = append(commands, []string{tmp + name + "_L2_ENA", boolToString(new_config.UbloxReceiver.CFG.SIGNAL.GLO.L2_ENA)})

	fmt.Print(".") // ちゃんと処理してますよ感を出す

	for i := 0; i < len(commands); i++ {
		if !debug {
			for {
				fmt.Print(".") // ちゃんと処理してますよ感を出す
				var cmd *exec.Cmd
				if new_config.UbloxReceiver.SaveConfig {
					cmd = exec.Command("ubxtool", "-f", "/dev/ttyACM0", "-w", "1", "-P", protVer, "-z", commands[i][0]+","+commands[i][1])
				} else {
					cmd = exec.Command("ubxtool", "-f", "/dev/ttyACM0", "-w", "1", "-P", protVer, "-z", commands[i][0]+","+commands[i][1]+","+"1")
				}
				var stdout bytes.Buffer
				var stderr bytes.Buffer
				cmd.Stdout = &stdout
				cmd.Stderr = &stderr
				err := cmd.Run()
				if err != nil {
					fmt.Fprintln(os.Stderr, err)
					fmt.Fprintln(os.Stderr, stderr.String())
					//os.Exit(1)
				} else {
					break
				}
			}
		} else {
			fmt.Println("[DEBUG]: skipped: ubxtool -f /dev/ttyACM0 -w 1 -P " + protVer + " -z " + commands[i][0] + "," + commands[i][1])
		}
	}

	// str2strを再起動する
	cmd = exec.Command("systemctl", "--user", "start", "str2str.service")
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if !debug {
		err := cmd.Run()
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			fmt.Fprintln(os.Stderr, stderr.String())
			os.Exit(1)
		}
	} else {
		fmt.Println("[DEBUG]: skipped: systemctl --user start str2str.service")
	}
	fmt.Print(".") // ちゃんと処理してますよ感を出す

	// デフォルトで設定をflashに保存するので、trueにしておく
	new_config.UbloxReceiver.SaveConfig = true

}
