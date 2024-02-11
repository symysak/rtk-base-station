package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/go-cmp/cmp"
	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

var validate *validator.Validate

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
	if !ValueCheck(fl.Field().String()) {
		return false
	}
	return true
}

// ntrip-casterのディレクトリのパス
var ntripcasterDir string

// commitCmd represents the commit command
var commitCmd = &cobra.Command{
	Use:   "commit",
	Short: "Commit changes to the system",
	Long:  "Commit changes to the system",

	RunE: func(cmd *cobra.Command, args []string) error {

		// ntripcasterDirの存在確認
		f, err := os.Stat(ntripcasterDir)
		if os.IsNotExist(err) || !f.IsDir() {
			fmt.Println(ntripcasterDir + " is not exist or not directory")
			os.Exit(1)
		}
		// ntripcasterのconfigが存在するか確認
		f, err = os.Stat(ntripcasterDir + "entrypoint.sh")
		if os.IsNotExist(err) || f.IsDir() {
			fmt.Println(ntripcasterDir + "entrypoint.sh is not exist or directory")
			os.Exit(1)
		}

		raw_running_config, err := os.ReadFile(configDir + "running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		raw_new_config, err := os.ReadFile(configDir + "new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		//
		// 諸々のチェック
		//
		fmt.Println("Checking...")

		var running_config models.Config
		json.Unmarshal(raw_running_config, &running_config)
		var new_config models.Config
		json.Unmarshal(raw_new_config, &new_config)

		// 差分チェック
		if running_config == new_config {
			fmt.Println("No changes to commit")
			os.Exit(0)
		}

		// バリデーションチェック
		validate = validator.New(validator.WithRequiredStructEnabled())
		err = validate.RegisterValidation("navsystem", validateNavSystem)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		err = validate.RegisterValidation("generator", validateGenerator)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		err = validate.Struct(new_config)
		if err != nil {
			fmt.Println(err)
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
				fmt.Println("Username and Password must be set together")
				os.Exit(1)
			}
		}

		fmt.Println("Check Completed")
		//
		// 諸々のチェックおわり
		//

		// 差分チェック
		fmt.Println(cmp.Diff(running_config, new_config))
		fmt.Println("ok? [y/N]")
		var ok string
		fmt.Scan(&ok)
		if ok != "y" {
			fmt.Println("Commit aborted")
			os.Exit(0)
		}

		// 差分のチェックが終わったのでconfigDir + new-config.jsonを書き換える
		new_new_config, err := os.Create(configDir + "new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_new_config.Close()
		encoder1 := json.NewEncoder(new_new_config)
		encoder1.SetIndent("", "  ")
		if err := encoder1.Encode(new_config); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		//
		// コミット処理
		//
		fmt.Println("Committing...")

		// ntrip-casterのコンテナのentrypoint.shを書き換える
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

		text += new_config.Ntripcaster.Mountpoint + ";"
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
		text += `exec /app/str2str -in tcpcli://localhost:2102#ubx -out "${out}"`
		text += " -p "
		text += strconv.FormatFloat(new_config.Ntripcaster.Latitude, 'f', 8, 64) + " "
		text += strconv.FormatFloat(new_config.Ntripcaster.Longitude, 'f', 8, 64) + " "
		text += strconv.FormatFloat(new_config.Ntripcaster.Height, 'f', 4, 64) + " "

		text += `-msg "`
		text += msg
		text += `" -opt -TADJ=1`

		//
		f2, err := os.Create(ntripcasterDir + "entrypoint.sh")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer f2.Close()
		f2.Write(([]byte)(text))

		// コンテナを再起動する
		exec.Command("podman", "restart", "ntrip-caster")

		fmt.Println("Commit Completed")
		//
		// コミット処理おわり
		//

		// コミットが終わったのでconfigDir + running-config.jsonを書き換える
		new_running_config, err := os.Create(configDir + "running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_running_config.Close()
		encoder2 := json.NewEncoder(new_running_config)
		encoder2.SetIndent("", "  ")
		if err := encoder2.Encode(new_config); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// もともとのrunning-configを念のため保存しておく
		var date string = strconv.Itoa(time.Now().Year()) + "-" + strconv.Itoa(int(time.Now().Month())) + "-" + strconv.Itoa(time.Now().Day()) + "-" + strconv.Itoa(time.Now().Hour()) + "-" + strconv.Itoa(time.Now().Minute()) + "-" + strconv.Itoa(time.Now().Second())
		fmt.Print("config backed up: " + configDir + "running-config." + date + ".json")
		running_config_bak, err := os.Create(configDir + "running-config." + date + ".json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer running_config_bak.Close()
		encoder3 := json.NewEncoder(running_config_bak)
		encoder3.SetIndent("", "  ")
		if err := encoder3.Encode(running_config); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(commitCmd)

	commitCmd.Flags().StringVarP(&ntripcasterDir, "ntripcaster-dir", "n", "", "ntripcaster directory ex: ../ntrip-caster/")
	commitCmd.MarkFlagRequired("ntripcaster-dir")
}
