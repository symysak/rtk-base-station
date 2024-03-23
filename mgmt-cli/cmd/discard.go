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

		running_config, err := os.Open(configDir + "running-config.json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		defer running_config.Close()

		new_config, err := os.Create(configDir + "new-config.json")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		defer new_config.Close()

		_, err = io.Copy(new_config, running_config)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(discardCmd)

}
