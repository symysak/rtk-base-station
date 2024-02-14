package models

type Config struct {
	Ntripcaster Ntripcaster `json:"ntripcaster"`
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
	Msg1077 int `json:"msg_1077" validate:"min=0"` // GPS MSM7 のinterval
	Msg1087 int `json:"msg_1087" validate:"min=0"` // GLONASS MSM7 のinterval
	Msg1097 int `json:"msg_1097" validate:"min=0"` // Galileo MSM7 のinterval
	Msg1107 int `json:"msg_1107" validate:"min=0"` // SBAS MSM7 のinterval
	Msg1117 int `json:"msg_1117" validate:"min=0"` // QZSS MSM7 のinterval
	Msg1127 int `json:"msg_1127" validate:"min=0"` // BeiDou MSM7 のinterval
	Msg1230 int `json:"msg_1230" validate:"min=0"` // GLONASS L1/L2 のinterval
}
