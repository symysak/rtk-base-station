package models

type Config struct {
	Ntripcaster Ntripcaster `json:"ntripcaster"`
}

type Ntripcaster struct {
	Username    string      `json:"username"`
	Password    string      `json:"password"`
	Port        int         `json:"port"`
	Mountpoint  string      `json:"mountpoint"`
	Sourcetable Sourcetable `json:"sourcetable"`
	Latitude    float64     `json:"latitude"`
	Longitude   float64     `json:"longitude"`
	Hight       float64     `json:"hight"`
	AntennaInfo string      `json:"antenna_info"`
}

type Sourcetable struct {
	Mountpoint     string        `json:"mountpoint"`
	Identifier     string        `json:"identifier"` // 地名等
	Format         string        `json:"format"`     // RTCM3 や ubx など
	FormatDetails  FormatDetails `json:"format_details"`
	Carrer         int           `json:"carrer"`          // 1: None, 2: L1, 3: L1+L2
	NavSystem      string        `json:"nav_system"`      // ex: GPS+GLONASS+Galileo+SBAS+QZSS+BeiDou
	Network        string        `json:"network"`         // ネットワーク名　なんでもいい
	Country        string        `json:"country"`         // ISO3166 の国コード
	ShortLatitude  float64       `json:"short_latitude"`  // 緯度
	ShortLongitude float64       `json:"short_longitude"` // 経度
	Nmea           int           `json:"nmea"`            // NMEAをクライアントが送信可能か 0: NG, 1: OK
	Solution       int           `json:"solution"`        // ソリューションの種類 0: 単一, 1: ネットワーク
	Generator      string        `json:"generator"`       // 生成ソフトウェア名
	ComprEncryp    string        `json:"compr_encryp"`    // 圧縮・暗号化の種類
	Authentication string        `json:"authentication"`  // 認証の種類 N: None, B: Basic, D: Digest
	Fee            string        `json:"fee"`             // 料金 N: No/Free, Y: Yes/Pay
	Bitrate        int           `json:"bitrate"`         // ビットレート
	Misc           string        `json:"misc"`            // その他
}

type FormatDetails struct {
	Msg1005 int `json:"msg_1005"` // 座標 のinterval
	Msg1008 int `json:"msg_1008"` // アンテナ記述子とシリアル番号 のinterval
	Msg1077 int `json:"msg_1077"` // GPS MSM7 のinterval
	Msg1087 int `json:"msg_1087"` // GLONASS MSM7 のinterval
	Msg1097 int `json:"msg_1097"` // Galileo MSM7 のinterval
	Msg1107 int `json:"msg_1107"` // SBAS MSM7 のinterval
	Msg1117 int `json:"msg_1117"` // QZSS MSM7 のinterval
	Msg1127 int `json:"msg_1127"` // BeiDou MSM7 のinterval
	Msg1230 int `json:"msg_1230"` // GLONASS L1/L2 のinterval
}
