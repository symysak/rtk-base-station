package cmd

import (
	"fmt"
	"io"
	"os"

	"github.com/spf13/cobra"
)

var discardCmd = &cobra.Command{
	Use:   "discard",
	Short: "Command to discard un-commited changes",
	Long:  `Command to discard un-commited changes`,
	RunE: func(cmd *cobra.Command, args []string) error {
		new_config, err := os.Open(configDir + "new-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer new_config.Close()

		running_config, err := os.Create(configDir + "running-config.json")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer running_config.Close()

		_, err = io.Copy(running_config, new_config)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(discardCmd)

}
