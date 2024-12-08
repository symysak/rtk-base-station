package models

type Config struct {
	Ntripcaster   Ntripcaster   `json:"ntripcaster"`
	UbloxReceiver UbloxReceiver `json:"ublox_receiver"`
	Debug         bool          `json:"debug"`
}

type Ntripcaster struct {
	Username    string      `json:"username" validate:"omitempty,alphanum"`
	Password    string      `json:"password" validate:"omitempty,alphanum"`
	Port        int         `json:"port" validate:"min=1024,max=65535,required"`
	Mountpoint  string      `json:"mountpoint" validate:"alphanum,required"`
	Sourcetable Sourcetable `json:"sourcetable"`
	Latitude    float64     `json:"latitude" validate:"latitude"`
	Longitude   float64     `json:"longitude" validate:"longitude"`
	Height      float64     `json:"height"`
	AntennaInfo string      `json:"antenna_info" validate:"omitempty,alphanum"`
}

type Sourcetable struct {
	Identifier    string        `json:"identifier" validate:"alphanum,required"` // 地名等
	Format        string        `json:"format" validate:"alphanum,required"`     // RTCM3 や ubx など
	FormatDetails FormatDetails `json:"format_details"`
	Carrer        int           `json:"carrer" validate:"oneof=1 2 3,required"`       // 1: None, 2: L1, 3: L1+L2
	NavSystem     string        `json:"nav_system" validate:"navsystem,required"`     // ex: GPS+GLONASS+Galileo+SBAS+QZSS+BeiDou
	Network       string        `json:"network" validate:"omitempty,alphanum"`        // ネットワーク名　なんでもいい
	Country       string        `json:"country" validate:"iso3166_1_alpha3,required"` // ISO3166 の国コード
	Nmea          int           `json:"nmea" validate:"min=0,max=1"`                  // NMEAをクライアントが送信可能か 0: NG, 1: OK
	Solution      int           `json:"solution" validate:"min=0,max=1"`              // ソリューションの種類 0: 単一, 1: ネットワーク
	Generator     string        `json:"generator" validate:"omitempty,generator"`     // 生成ソフトウェア名
	ComprEncryp   string        `json:"compr_encryp" validate:"alphanum,required"`    // 圧縮・暗号化の種類
	Fee           string        `json:"fee" validate:"oneof=N Y,required"`            // 料金 N: No/Free, Y: Yes/Pay
	Bitrate       string        `json:"bitrate" validate:"omitempty,alphanum"`        // ビットレート
	Misc          string        `json:"misc" validate:"omitempty,alphanum"`           // その他
}

type FormatDetails struct {
	Msg1005 int `json:"msg_1005" validate:"min=1"` // 座標 のinterval
	Msg1008 int `json:"msg_1008" validate:"min=0"` // アンテナ記述子とシリアル番号 のinterval
	Gps int `json:"msg_1077" validate:"min=0"` // GPS のinterval
	Glonass int `json:"msg_1087" validate:"min=0"` // GLONASS のinterval
	Galileo int `json:"msg_1097" validate:"min=0"` // Galileo のinterval
	Sbas int `json:"msg_1107" validate:"min=0"` // SBAS のinterval
	Qzss int `json:"msg_1117" validate:"min=0"` // QZSS のinterval
	BeiDou int `json:"msg_1127" validate:"min=0"` // BeiDou のinterval
}

type UbloxReceiver struct {
	SaveConfig bool `json:"save_config"` // レシーバのconfigを保存するflag
	CFG        CFG  `json:"CFG"`
}

type CFG struct {
	MSGOUT MSGOUT `json:"MSGOUT"`
	SIGNAL SIGNAL `json:"SIGNAL"`
}

type MSGOUT struct {
	NMEA NMEA `json:"NMEA"`
	UBX  UBX  `json:"UBX"`
}

type NMEA struct {
	ID ID `json:"ID"`
}

type ID struct {
	GGA OutputDestination `json:"GGA"`
	GLL OutputDestination `json:"GLL"`
	GSA OutputDestination `json:"GSA"`
	GSV OutputDestination `json:"GSV"`
	RMC OutputDestination `json:"RMC"`
	VTG OutputDestination `json:"VTG"`
}

type UBX struct {
	NAV NAV `json:"NAV"`
	RXM RXM `json:"RXM"`
}

type NAV struct {
	SAT OutputDestination `json:"SAT"`
	PVT OutputDestination `json:"PVT"`
}

type RXM struct {
	RAWX  OutputDestination `json:"RAWX"`
	SFRBX OutputDestination `json:"SFRBX"`
}

type OutputDestination struct {
	I2C   bool `json:"I2C"`
	SPI   bool `json:"SPI"`
	UART1 bool `json:"UART1"`
	UART2 bool `json:"UART2"`
	USB   bool `json:"USB"`
}

type SIGNAL struct {
	GPS  GPS  `json:"GPS"`
	SBAS SBAS `json:"SBAS"`
	GAL  GAL  `json:"GAL"`
	BDS  BDS  `json:"BDS"`
	QZSS QZSS `json:"QZSS"`
	GLO  GLO  `json:"GLO"`
}

type GPS struct {
	ENA      bool `json:"ENA"`
	L1CA_ENA bool `json:"L1CA_ENA"`
	L2C_ENA  bool `json:"L2C_ENA"`
}

type SBAS struct {
	ENA      bool `json:"ENA"`
	L1CA_ENA bool `json:"L1CA_ENA"`
}

type GAL struct {
	ENA     bool `json:"ENA"`
	E1_ENA  bool `json:"E1_ENA"`
	E5B_ENA bool `json:"E5B_ENA"`
}

type BDS struct {
	ENA    bool `json:"ENA"`
	B1_ENA bool `json:"B1_ENA"`
	B2_ENA bool `json:"B2_ENA"`
}

type QZSS struct {
	ENA      bool `json:"ENA"`
	L1CA_ENA bool `json:"L1CA_ENA"`
	L1S_ENA  bool `json:"L1S_ENA"`
	L2C_ENA  bool `json:"L2C_ENA"`
}

type GLO struct {
	ENA    bool `json:"ENA"`
	L1_ENA bool `json:"L1_ENA"`
	L2_ENA bool `json:"L2_ENA"`
}
