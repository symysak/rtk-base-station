package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/google/go-cmp/cmp"
	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

var validate *validator.Validate

// commitCmd represents the commit command
var commitCmd = &cobra.Command{
	Use:   "commit",
	Short: "Commit changes to the system",
	Long:  "Commit changes to the system",

	RunE: func(cmd *cobra.Command, args []string) error {

		raw_running_config, err := os.ReadFile("mgmt-cli/running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		raw_new_config, err := os.ReadFile("mgmt-cli/new-config.json")
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
		err = validate.Struct(new_config)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		if running_config.Ntripcaster.Mountpoint != new_config.Ntripcaster.Mountpoint {

			// Ntripcaster.Mountpointのみを設定される想定なので
			// 絶対に異なるけど念のため確認
			if new_config.Ntripcaster.Mountpoint != new_config.Ntripcaster.Sourcetable.Mountpoint {

				// Ntripcaster.Sourcetable.Mountpointも変更する
				new_config.Ntripcaster.Sourcetable.Mountpoint = new_config.Ntripcaster.Mountpoint
			}
		}

		// Ntripcaster.Sourcetable.AuthenticationはUsernameとPasswordの有無で決まる
		if new_config.Ntripcaster.Username == "" && new_config.Ntripcaster.Password == "" {
			new_config.Ntripcaster.Sourcetable.Authentication = "N"
		} else {
			new_config.Ntripcaster.Sourcetable.Authentication = "Y"
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

		// 差分のチェック後にmgmt-cli/new-config.jsonを書き換える
		new_new_config, err := os.Create("mgmt-cli/new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_new_config.Close()
		encoder1 := json.NewEncoder(new_new_config)
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

		if new_config.Ntripcaster.Sourcetable.Authentication == "Y" {
			text += "ntripc://"
			text += new_config.Ntripcaster.Username
			text += ":"
			text += new_config.Ntripcaster.Password
			text += "@:2101"
		} else {
			text += "ntripc://:2101"
		}

		text += "/"

		text += new_config.Ntripcaster.Sourcetable.Mountpoint + ";"
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
		text += strconv.FormatFloat(new_config.Ntripcaster.Sourcetable.ShortLatitude, 'f', 2, 64) + ";"
		text += strconv.FormatFloat(new_config.Ntripcaster.Sourcetable.ShortLongitude, 'f', 2, 64) + ";"
		text += strconv.Itoa(new_config.Ntripcaster.Sourcetable.Nmea) + ";"
		text += strconv.Itoa(new_config.Ntripcaster.Sourcetable.Solution) + ";"
		text += new_config.Ntripcaster.Sourcetable.Generator + ";"
		text += new_config.Ntripcaster.Sourcetable.ComprEncryp + ";"
		text += new_config.Ntripcaster.Sourcetable.Authentication + ";"
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

		f, err := os.Create("ntrip-caster/entrypoint.sh")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer f.Close()
		f.Write(([]byte)(text))

		// コンテナを再起動する
		exec.Command("podman", "restart", "ntrip-caster")

		fmt.Println("Commit Completed")
		//
		// コミット処理おわり
		//

		// コミット後にmgmt-cli/running-config.jsonを書き換える
		new_running_config, err := os.Create("mgmt-cli/running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_running_config.Close()
		encoder2 := json.NewEncoder(new_running_config)
		if err := encoder2.Encode(new_config); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(commitCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// commitCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// commitCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
