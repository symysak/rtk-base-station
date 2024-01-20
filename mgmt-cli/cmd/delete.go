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

// deleteCmd represents the delete command
var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Command to delete a value",
	Long:  "Command to delete a value",

	RunE: func(cmd *cobra.Command, args []string) error {

		if len(args) < 1 {
			return fmt.Errorf("Too few arguments")
		} else if len(args) > 1 {
			return fmt.Errorf("Too many arguments")
		}

		raw_new_config, err := os.ReadFile("mgmt-cli/new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		var new_config models.Config
		json.Unmarshal(raw_new_config, &new_config)

		v := reflect.ValueOf(&new_config).Elem() // Obtain the addressable value.
		for _, name := range strings.Split(args[0], ".") {
			v = v.FieldByName(name)
			if v.Kind() == reflect.Invalid {
				fmt.Println("Key not found")
				os.Exit(1)
			}
		}

		switch v.Kind() {
		case reflect.String:
			v.SetString("")
		case reflect.Int:
			v.SetInt(int64(0))
		case reflect.Float64:
			v.SetFloat(float64(0.0))
		}

		new_new_config, err := os.Create("mgmt-cli/new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_new_config.Close()
		encoder := json.NewEncoder(new_new_config)
		if err := encoder.Encode(new_config); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(deleteCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// deleteCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// deleteCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
