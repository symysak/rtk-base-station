/*
    レシーバの衛星選択用
*/
const scripts = [
    // [mgmt-cliのKey, id]
    ["UbloxReceiver.SaveConfig", "SaveConfig"],
    // GPS
    ["UbloxReceiver.CFG.SIGNAL.GPS.ENA", "GPS-ENA"],
    ["UbloxReceiver.CFG.SIGNAL.GPS.L1CA_ENA", "GPS-L1CA_ENA"],
    ["UbloxReceiver.CFG.SIGNAL.GPS.L2C_ENA", "GPS-L2C_ENA"],
    // SBAS
    ["UbloxReceiver.CFG.SIGNAL.SBAS.ENA", "SBAS-ENA"],
    ["UbloxReceiver.CFG.SIGNAL.SBAS.L1CA_ENA", "SBAS-L1CA_ENA"],
    // GAL
    ["UbloxReceiver.CFG.SIGNAL.GAL.ENA", "GAL-ENA"],
    ["UbloxReceiver.CFG.SIGNAL.GAL.E1_ENA", "GAL-E1_ENA"],
    ["UbloxReceiver.CFG.SIGNAL.GAL.E5B_ENA", "GAL-E5B_ENA"],
    // BDS
    ["UbloxReceiver.CFG.SIGNAL.BDS.ENA", "BDS-ENA"],
    ["UbloxReceiver.CFG.SIGNAL.BDS.B1_ENA", "BDS-B1_ENA"],
    ["UbloxReceiver.CFG.SIGNAL.BDS.B2_ENA", "BDS-B2_ENA"],
    // QZSS
    ["UbloxReceiver.CFG.SIGNAL.QZSS.ENA", "QZSS-ENA"],
    ["UbloxReceiver.CFG.SIGNAL.QZSS.L1CA_ENA", "QZSS-L1CA_ENA"],
    ["UbloxReceiver.CFG.SIGNAL.QZSS.L1S_ENA", "QZSS-L1S_ENA"],
    ["UbloxReceiver.CFG.SIGNAL.QZSS.L2C_ENA", "QZSS-L2C_ENA"],
    // GLO
    ["UbloxReceiver.CFG.SIGNAL.GLO.ENA", "GLO-ENA"],
    ["UbloxReceiver.CFG.SIGNAL.GLO.L1_ENA", "GLO-L1_ENA"],
    ["UbloxReceiver.CFG.SIGNAL.GLO.L2_ENA", "GLO-L2_ENA"],
]
const cliPath = "~/rtk-base-station/mgmt-cli/mgmt-cli"
const configPath = "~/rtk-base-station/config/"

// 衛星選択の項目用の値をgetする関数
const sendGetCommandAboutSignal = () => {
    for (let i = 0; i < scripts.length; i++) {
        process = cockpit.script(`${cliPath} -c ${configPath} get ${scripts[i][0]}`);
        process.then(data => {
            console.log(scripts[i][0] + " = " + data);
            if(data){
                document.getElementById(scripts[i][1]).disabled = false;
                document.getElementById(scripts[i][1]).checked = true;
            }
            else if (!data){
                document.getElementById(scripts[i][1]).disabled = false;
                document.getElementById(scripts[i][1]).checked = false;
            }
        });
        process.catch(exception => {
            console.error(`Failed to get ${scripts[i][0]}`);
            console.error(exception);
        });
    }
}

// 衛星選択の項目用の値をsetする関数
const sendSetCommandAboutSatelite = () => {
    for (let i = 0; i < scripts.length; i++) {
        if(document.getElementById(scripts[i][1]).disabled) continue;

        const element = document.getElementById(scripts[i][1]).checked;
        let value;
        if(element){
            value = "1"
        }
        else if (!element){
            value = "0"
        }
        else{
            continue;
        }
        process = cockpit.script(`${cliPath} -c ${configPath} set ${scripts[i][0]} ${value}`);
        process.then(res => {
            console.log(res);
        });
    }
}

sendGetCommandAboutSignal();