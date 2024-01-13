package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

var showCmd = &cobra.Command{
	Use:   "show",
	Short: "Command to show running configuration",
	Long:  `Command to show running configuration`,
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("show called")

		raw_running_config, err := os.ReadFile("mgmt-cli/running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		var running_config models.Config
		json.Unmarshal(raw_running_config, &running_config)

		bytes, err := json.MarshalIndent(running_config, "", "    ")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		fmt.Println(string(bytes))

		return nil
	},
}

func init() {
	rootCmd.AddCommand(showCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// showCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// showCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
