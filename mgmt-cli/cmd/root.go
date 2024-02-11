package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "mgmt-cli",
	Short: "Configuration Management Tools",
	Long:  "Configuration Management Tools",
	Run: func(cmd *cobra.Command, args []string) {

		// configDirの存在確認
		f, err := os.Stat(configDir)
		if os.IsNotExist(err) || !f.IsDir() {
			fmt.Println(configDir + " is not exist or not directory")
			os.Exit(1)
		}
	},
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

// configファイルがあるディレクトリのパス
var configDir string

func init() {
	rootCmd.PersistentFlags().StringVarP(&configDir, "config-dir", "c", "", "config file directory ex: mgmt-cli/")
	rootCmd.MarkPersistentFlagRequired("config-dir")
}
