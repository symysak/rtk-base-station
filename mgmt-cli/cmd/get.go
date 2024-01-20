package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strings"

	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Command to get a value from key",
	Long:  "Command to get a value from key",
	RunE: func(cmd *cobra.Command, args []string) error {
		if len(args) == 0 {
			return fmt.Errorf("No key specified")
		} else if len(args) > 1 {
			return fmt.Errorf("Too many arguments")
		}

		raw_running_config, err := os.ReadFile("mgmt-cli/running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		var running_config models.Config
		json.Unmarshal(raw_running_config, &running_config)

		v := reflect.ValueOf(running_config)
		for _, name := range strings.Split(args[0], ".") {
			v = reflect.Indirect(v).FieldByName(name)
			if v.Kind() == reflect.Invalid {
				fmt.Println("Key not found")
				os.Exit(1)
			}
		}

		fmt.Println(v)

		return nil
	},
}

func init() {
	rootCmd.AddCommand(getCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// getCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// getCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
