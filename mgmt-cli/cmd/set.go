package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
	"github.com/symysak/rtk-base-station/mgmt-cli/models"
)

var setCmd = &cobra.Command{
	Use:   "set",
	Short: "Command to set a value",
	Long:  "Command to set a value",
	RunE: func(cmd *cobra.Command, args []string) error {

		if len(args) < 2 {
			return fmt.Errorf("Too few arguments")
		} else if len(args) > 2 {
			return fmt.Errorf("Too many arguments")
		}

		raw_new_config, err := os.ReadFile(configDir + "new-config.json")
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
			v.SetString(args[1])
		case reflect.Int:
			n, _ := strconv.Atoi(args[1])
			v.SetInt(int64(n))
		case reflect.Float64:
			n, _ := strconv.ParseFloat(args[1], 64)
			v.SetFloat(float64(n))
		case reflect.Bool:
			n, _ := strconv.ParseBool(args[1])
			v.SetBool(n)
		}

		// 設定した内容を表示
		fmt.Println(args[0], "=", v)

		new_new_config, err := os.Create(configDir + "new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_new_config.Close()
		encoder := json.NewEncoder(new_new_config)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(new_config); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

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
