package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Command to get a value",
	Long:  "Command to set a value",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("get called")
		if len(args) == 0 {
			return fmt.Errorf("No key specified")
		} else if len(args) > 1 {
			return fmt.Errorf("Too many arguments")
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
