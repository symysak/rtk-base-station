package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models/config"
)

var setCmd = &cobra.Command{
	Use:   "set",
	Short: "Command to set a value",
	Long:  "Command to set a value",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("set called")

		if len(args) < 2 {
			return fmt.Errorf("Too few arguments")
		} else if len(args) > 2 {
			return fmt.Errorf("Too many arguments")
		}

		json.MarshalIndent(&post, "", "\t\t")

		return nil
	},
}

func init() {
	rootCmd.AddCommand(setCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// setCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// setCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
