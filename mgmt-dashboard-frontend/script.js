/*
    レシーバの衛星選択用
*/
const satelites = [
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
const sendGetCommandAboutSignal = async () => {
    for (let i = 0; i < satelites.length; i++) {
        process = await cockpit.script(`${cliPath} -c ${configPath} get ${satelites[i][0]}`)
        .then(data => {
            console.log(`${satelites[i][0]}: ${data}`);
            if(data.includes("true")){
                document.getElementById(satelites[i][1]).disabled = false;
                document.getElementById(satelites[i][1]).checked = true;
            }
            else if (data.includes("false")){
                document.getElementById(satelites[i][1]).disabled = false;
                document.getElementById(satelites[i][1]).checked = false;
            }
        }).catch(exception => {
            console.error(`Failed to get ${satelites[i][0]}`);
            console.error(exception);
        });
    }
}

const sendGetCommand = async () => {
    await sendGetCommandAboutSignal();
    document.getElementById("loadingAnimation").classList.remove("pf-v5-c-skeleton");
};

let blockReload = false;

window.addEventListener('beforeunload', (e) => {
    if(blockReload){
        const message = '操作を実行中です。画面を離れないでください';
        e.preventDefault();
        e.returnValue = message;
        return message;
    }
})


let queue = [];

// 衛星選択の項目用の値をqueueに追加する関数
const addSateliteToQueue = () => {
    for (let i = 0; i < satelites.length; i++) {
        if(document.getElementById(satelites[i][1]).disabled) continue;

        const element = document.getElementById(satelites[i][1]).checked;
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
        queue.push([satelites[i][0], value]);
        
    }
    console.log(queue);
}

const sendSetCommand = async () => {
    blockReload = true;

    document.getElementById("set-button").disabled = true;
    document.getElementById("progress-bar").classList.remove("pf-m-danger");
    document.getElementById("progress-bar").classList.remove("pf-m-success");
    document.getElementById("progress-icon").classList.remove("fa-times-circle");
    document.getElementById("progress-icon").classList.add("fa-check-circle");
    addSateliteToQueue();
    
    const len = queue.length;
    for(let i = 0; i < len; i++){
        process = await cockpit.script(`${cliPath} -c ${configPath} set ${queue[i][0]} ${queue[i][1]}`)
        .then(res => {
            const progress = Math.floor((i + 1) / len * 100);
            document.getElementById("progress-num-outside").innerText = `${progress}%`;
            document.getElementById("progress-num-inside").style.width = `${progress}%`;
            console.log(progress);
            console.log(res);
        }).catch(exception => {
            console.error(exception);
            document.getElementById("progress-num-outside").innerText = "設定の保存に失敗しました";
            document.getElementById("progress-bar").classList.add("pf-m-danger");
            document.getElementById("progress-icon").classList.add("fa-times-circle");
            document.getElementById("progress-icon").classList.remove("fa-check-circle");
        });
    }
    document.getElementById("progress-bar").classList.add("pf-m-success");
    queue = [];
    document.getElementById("set-button").disabled = false;

    blockReload = false;
};

const sendCompareCommand = async () => {
    document.getElementById("compare-button").disabled = true;
    process = await cockpit.script(`${cliPath} -c ${configPath} compare`)
    .then(res => {
        document.getElementById("comparison-area").innerText = res;
        document.getElementById("compare-button").disabled = false;
    });
};

const sendCommitCommand = async () => {
    blockReload = true;

    str2strPath = "~/rtk-base-station/str2str/";
    ntripcasterPath = "~/rtk-base-station/ntrip-caster/";
    document.getElementById("result-area").innerText = "";
    document.getElementById("commit-button").disabled = true;

    process = await cockpit.script(`${cliPath} -c ${configPath} commit -s ${str2strPath} -n ${ntripcasterPath}`)
    .stream(res => {
        document.getElementById("result-area").innerText += res;
    });
    document.getElementById("commit-button").disabled = false;

    blockReload = false;
};

sendGetCommand();