package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/google/go-cmp/cmp"
	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

// compareCmd represents the compare command
var compareCmd = &cobra.Command{
	Use:   "compare",
	Short: "Commnad to show config diffs",
	Long:  "Command to show config diffs",
	RunE: func(cmd *cobra.Command, args []string) error {

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

		// 差分確認画面を表示
		if cmp.Equal(running_config, new_config) {
			fmt.Println("No changes")
		} else {
			fmt.Println(cmp.Diff(running_config, new_config))
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(compareCmd)
}
