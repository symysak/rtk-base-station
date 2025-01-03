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
			fmt.Fprintln(os.Stderr, "No key specified")
			os.Exit(1)
		} else if len(args) > 1 {
			fmt.Fprintln(os.Stderr, "Too many arguments")
			os.Exit(1)
		}

		raw_running_config, err := os.ReadFile(configDir + "running-config.json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}

		var running_config models.Config
		json.Unmarshal(raw_running_config, &running_config)

		v := reflect.ValueOf(running_config)
		for _, name := range strings.Split(args[0], ".") {
			v = reflect.Indirect(v).FieldByName(name)
			if v.Kind() == reflect.Invalid {
				fmt.Fprintln(os.Stderr, "Key not found")
				os.Exit(1)
			}
		}

		switch v.Kind() {
		case reflect.String:
			fmt.Println(v.String())
		case reflect.Int:
			fmt.Println(v.Int())
		case reflect.Float64:
			fmt.Println(v.Float())
		case reflect.Bool:
			fmt.Println(v.Bool())
		default:
			fmt.Fprintln(os.Stderr, "Invalid Key")
			os.Exit(1)
		}

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
