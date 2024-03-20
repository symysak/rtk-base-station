import React from 'react'
import { useEffect } from 'react';
import cockpit from '../cockpit/pkg/lib/cockpit';


import {
    Alert,
    Button,
    Card,
    CardTitle,
    CardBody,
    CodeBlock,
    CodeBlockCode,
    Panel,
    PanelMain,
    PanelMainBody,
    PanelHeader,
    Divider,
    Switch,
    Stack,
    StackItem,
    PageSection,
    Progress,
    ProgressMeasureLocation,
    ProgressVariant,
    Skeleton
} from '@patternfly/react-core';
import '@patternfly/react-core/dist/styles/base.css';
import Layout from '../layout';

function SateliteSelection() {

    // ここからConfig関連のstate
    const [saveConfig, setSaveConfig] = React.useState(undefined);

    const [GpsEnabled, setGpsEnabled] = React.useState(undefined);

    const [GpsL1caEnabled, setGpsL1caEnabled] = React.useState(undefined);
    const [GpsL2cEnabled, setGpsL2cEnabled] = React.useState(undefined);

    const [SbasEnabled, setSbasEnabled] = React.useState(undefined);
    const [SbasL1caEnabled, setSbasL1caEnabled] = React.useState(undefined);

    const [GalileoEnabled, setGalileoEnabled] = React.useState(undefined);
    const [GalileoE1Enabled, setGalileoE1Enabled] = React.useState(undefined);
    const [GalileoE5bEnabled, setGalileoE5bEnabled] = React.useState(undefined);

    const [BeidoEnabled, setBeidoEnabled] = React.useState(undefined);
    const [BeidoB1Enabled, setBeidoB1Enabled] = React.useState(undefined);
    const [BeidoB2Enabled, setBeidoB2Enabled] = React.useState(undefined);

    const [QzssEnabled, setQzssEnabled] = React.useState(undefined);
    const [QzssL1caEnabled, setQzssL1caEnabled] = React.useState(undefined);
    const [QzssL1sEnabled, setQzssL1sEnabled] = React.useState(undefined);
    const [QzssL2cEnabled, setQzssL2cEnabled] = React.useState(undefined);

    const [GlonassEnabled, setGlonassEnabled] = React.useState(undefined);
    const [GlonassL1Enabled, setGlonassL1Enabled] = React.useState(undefined);
    const [GlonassL2Enabled, setGlonassL2Enabled] = React.useState(undefined);
    // ここまでConfig関連のstate

    const [progressColor, setProgressColor] = React.useState('primary');

    const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

    const [SETcommandProgress, setSETcommandProgress] = React.useState(0);
    const [isGETcommandComplete, setIsGETcommandComplete] = React.useState(false);

    const [resultOfCompareCommand, setResultOfCompareCommand] = React.useState('差分を表示ボタンを押してください');

    const [resultOfCommitCommand, setResultOfCommitCommand] = React.useState('設定を適用ボタンを押してください');


    const cliPath = "~/rtk-base-station/mgmt-cli/mgmt-cli";
    const configPath = "~/rtk-base-station/config/";

    const sendGetCommand = async (key) => {
        let res = undefined;
        await cockpit.script(`${cliPath} -c ${configPath} get ${key}`)
            .then(data => {
                if (data.includes("true")) {
                    res = true;
                }
                else if (data.includes("false")) {
                    res = false;
                }
            }).catch(exception => {
                console.error(`Failed to get ${key}`);
                console.error(exception);
            });
        console.log(`[GET] ${key}: ${res}`);
        return res;
    };
    useEffect(() => {
        (async () => {
            setSaveConfig(await sendGetCommand("UbloxReceiver.SaveConfig"));

            setGpsEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GPS.ENA"));
            setGpsL1caEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L1CA_ENA"));
            setGpsL2cEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L2C_ENA"));

            setSbasEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.ENA"));
            setSbasL1caEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.L1CA_ENA"));

            setGalileoEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GAL.ENA"));
            setGalileoE1Enabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E1_ENA"));
            setGalileoE5bEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E5B_ENA"));

            setBeidoEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.BDS.ENA"));
            setBeidoB1Enabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B1_ENA"));
            setBeidoB2Enabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B2_ENA"));

            setQzssEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.ENA"));
            setQzssL1caEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1CA_ENA"));
            setQzssL1sEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1S_ENA"));
            setQzssL2cEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L2C_ENA"));

            setGlonassEnabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GLO.ENA"));
            setGlonassL1Enabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L1_ENA"));
            setGlonassL2Enabled(await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L2_ENA"));

            setIsGETcommandComplete(true);
        })();

    }, []);

    



    // setするアイテムの数
    const itemCount = 19;
    // setしたアイテムの数
    let SETcommandCount = 0;
    const sendSetCommand = async (key, value) => {
        await cockpit.script(`${cliPath} -c ${configPath} set ${key} ${value}`)
            .then(data => {
                console.log("[SET] " + data);
            }).catch(exception => {
                console.error(`Failed to set ${key} ${value}`);
                console.error(exception);
            });
        SETcommandCount++;
        setSETcommandProgress(Math.floor(SETcommandCount / itemCount * 100));
    }
    const setButtonHandler = async () => {

        setIsButtonDisabled(true);
        setProgressColor("primary");
        if (saveConfig == undefined

            || GpsEnabled == undefined
            || GpsL1caEnabled == undefined
            || GpsL2cEnabled == undefined

            || SbasEnabled == undefined
            || SbasL1caEnabled == undefined

            || GalileoEnabled == undefined
            || GalileoE1Enabled == undefined
            || GalileoE5bEnabled == undefined

            || BeidoEnabled == undefined
            || BeidoB1Enabled == undefined
            || BeidoB2Enabled == undefined

            || QzssEnabled == undefined
            || QzssL1caEnabled == undefined
            || QzssL1sEnabled == undefined
            || QzssL2cEnabled == undefined

            || GlonassEnabled == undefined
            || GlonassL1Enabled == undefined
            || GlonassL2Enabled == undefined

        ) {
            console.log("getコマンドが失敗しているkeyがあります");
            setProgressColor("danger");
            setIsButtonDisabled(false);
            return;
        }

        SETcommandCount = 0;
        await sendSetCommand("UbloxReceiver.SaveConfig", saveConfig);

        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GPS.ENA", GpsEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L1CA_ENA", GpsL1caEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L2C_ENA", GpsL2cEnabled);
    
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.ENA", SbasEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.L1CA_ENA", SbasL1caEnabled);

        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GAL.ENA", GalileoEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E1_ENA", GalileoE1Enabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E5B_ENA", GalileoE5bEnabled);

        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.BDS.ENA", BeidoEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B1_ENA", BeidoB1Enabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B2_ENA", BeidoB2Enabled);

        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.ENA", QzssEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1CA_ENA", QzssL1caEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1S_ENA", QzssL1sEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L2C_ENA", QzssL2cEnabled);

        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GLO.ENA", GlonassEnabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L1_ENA", GlonassL1Enabled);
        await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L2_ENA", GlonassL2Enabled);

        setProgressColor("success");
        setIsButtonDisabled(false);

        return;
    }

    const sendCompareCommand = async () => {
        setIsButtonDisabled(true);
        await cockpit.script(`${cliPath} -c ${configPath} compare`)
            .then(data => {
                setResultOfCompareCommand(data);
                setIsButtonDisabled(false);
            }).catch(exception => {
                console.error(`Failed to compare`);
                console.error(exception);
                setIsButtonDisabled(false);
            });
    };

    const str2strPath = "~/rtk-base-station/str2str/";
    const ntripcasterPath = "~/rtk-base-station/ntrip-caster/"
    const sendCommitCommand = async () => {
        setIsButtonDisabled(true);
        setResultOfCommitCommand("");
        
        await cockpit.script(`${cliPath} -c ${configPath} commit -s ${str2strPath} -n ${ntripcasterPath}`)
            .stream(data => {
                setResultOfCommitCommand(resultOfCommitCommand => resultOfCommitCommand + data);
            })
            .then(data => {
                setIsButtonDisabled(false);
            }).catch(exception => {
                console.error(`Failed to commit`);
                console.error(exception);
                setIsButtonDisabled(false);
            });
    };

    return (
        <Layout>
            <PageSection>
                <Stack>

                    <StackItem>
                        <Card>
                            <CardBody>
                                <Switch
                                    label="設定を再起動後も保存する"
                                    isChecked={saveConfig == undefined ? false : saveConfig}
                                    onChange={() => setSaveConfig(!saveConfig)}
                                    ouiaId="BasicSwitch"
                                    isDisabled={saveConfig == undefined ? true : false}
                                />
                            </CardBody>
                        </Card>
                    </StackItem>

                    <br />

                    <StackItem>
                        <Card>
                            <CardTitle>使用する衛星</CardTitle>
                            <CardBody>

                                <Panel>
                                    <PanelHeader>
                                        <Switch
                                            label="GPSを使用する"
                                            isChecked={GpsEnabled == undefined ? false : GpsEnabled}
                                            onChange={() => setGpsEnabled(!GpsEnabled)}
                                            ouiaId="BasicSwitch"
                                            isDisabled={GpsEnabled == undefined ? true : false}
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1CA"
                                                isChecked={GpsL1caEnabled == undefined ? false : GpsL1caEnabled}
                                                onChange={() => setGpsL1caEnabled(!GpsL1caEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={GpsL1caEnabled == undefined ? true : false}
                                            />
                                            <br />
                                            <Switch
                                                label="L2C"
                                                isChecked={GpsL2cEnabled == undefined ? false : GpsL2cEnabled}
                                                onChange={() => setGpsL2cEnabled(!GpsL2cEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={GpsL2cEnabled == undefined ? true : false}
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                                <br />

                                <Panel>
                                    <PanelHeader>
                                        <Switch
                                            label="SBASを使用する"
                                            isChecked={SbasEnabled == undefined ? false : SbasEnabled}
                                            onChange={() => setSbasEnabled(!SbasEnabled)}
                                            ouiaId="BasicSwitch"
                                            isDisabled={SbasEnabled == undefined ? true : false}
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1CA"
                                                isChecked={SbasL1caEnabled == undefined ? false : SbasL1caEnabled}
                                                onChange={() => setSbasL1caEnabled(!SbasL1caEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={SbasL1caEnabled == undefined ? true : false}
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                                <br />

                                <Panel>
                                    <PanelHeader>
                                        <Switch
                                            label="Galileoを使用する"
                                            isChecked={GalileoEnabled == undefined ? false : GalileoEnabled}
                                            onChange={() => setGalileoEnabled(!GalileoEnabled)}
                                            ouiaId="BasicSwitch"
                                            isDisabled={GalileoEnabled == undefined ? true : false}
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="E1"
                                                isChecked={GalileoE1Enabled == undefined ? false : GalileoE1Enabled}
                                                onChange={() => setGalileoE1Enabled(!GalileoE1Enabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={GalileoE1Enabled == undefined ? true : false}
                                            />
                                            <br />
                                            <Switch
                                                label="E5b"
                                                isChecked={GalileoE5bEnabled == undefined ? false : GalileoE5bEnabled}
                                                onChange={() => setGalileoE5bEnabled(!GalileoE5bEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={GalileoE5bEnabled == undefined ? true : false}
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                                <br />

                                <Panel>
                                    <PanelHeader>
                                        <Switch
                                            label="BeiDoを使用する"
                                            isChecked={BeidoEnabled == undefined ? false : BeidoEnabled}
                                            onChange={() => setBeidoEnabled(!BeidoEnabled)}
                                            ouiaId="BasicSwitch"
                                            isDisabled={BeidoEnabled == undefined ? true : false}
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="B1"
                                                isChecked={BeidoB1Enabled == undefined ? false : BeidoB1Enabled}
                                                onChange={() => setBeidoB1Enabled(!BeidoB1Enabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={BeidoB1Enabled == undefined ? true : false}
                                            />
                                            <br />
                                            <Switch
                                                label="B2"
                                                isChecked={BeidoB2Enabled == undefined ? false : BeidoB2Enabled}
                                                onChange={() => setBeidoB2Enabled(!BeidoB2Enabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={BeidoB2Enabled == undefined ? true : false}
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                                <br />

                                <Panel>
                                    <PanelHeader>
                                        <Switch
                                            label="QZSSを使用する"
                                            isChecked={QzssEnabled == undefined ? false : QzssEnabled}
                                            onChange={() => setQzssEnabled(!QzssEnabled)}
                                            ouiaId="BasicSwitch"
                                            isDisabled={QzssEnabled == undefined ? true : false}
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1CA"
                                                isChecked={QzssL1caEnabled == undefined ? false : QzssL1caEnabled}
                                                onChange={() => setQzssL1caEnabled(!QzssL1caEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={QzssL1caEnabled == undefined ? true : false}
                                            />
                                            <br />
                                            <Switch
                                                label="L1S"
                                                isChecked={QzssL1sEnabled == undefined ? false : QzssL1sEnabled}
                                                onChange={() => setQzssL1sEnabled(!QzssL1sEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={QzssL1sEnabled == undefined ? true : false}
                                            />
                                            <br />
                                            <Switch
                                                label="L2C"
                                                isChecked={QzssL2cEnabled == undefined ? false : QzssL2cEnabled}
                                                onChange={() => setQzssL2cEnabled(!QzssL2cEnabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={QzssL2cEnabled == undefined ? true : false}
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                                <br />

                                <Panel>
                                    <PanelHeader>
                                        <Switch
                                            label="GLONASSを使用する"
                                            isChecked={GlonassEnabled == undefined ? false : GlonassEnabled}
                                            onChange={() => setGlonassEnabled(!GlonassEnabled)}
                                            ouiaId="BasicSwitch"
                                            isDisabled={GlonassEnabled == undefined ? true : false}
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1"
                                                isChecked={GlonassL1Enabled == undefined ? false : GlonassL1Enabled}
                                                onChange={() => setGlonassL1Enabled(!GlonassL1Enabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={GlonassL1Enabled == undefined ? true : false}
                                            />
                                            <br />
                                            <Switch
                                                label="L2"
                                                isChecked={GlonassL2Enabled == undefined ? false : GlonassL2Enabled}
                                                onChange={() => setGlonassL2Enabled(!GlonassL2Enabled)}
                                                ouiaId="BasicSwitch"
                                                isDisabled={GlonassL2Enabled == undefined ? true : false}
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                            </CardBody>
                        </Card>
                    </StackItem>

                    <br />

                    <StackItem>
                        <Card>
                            {isGETcommandComplete ? (
                                <>
                                    <CardTitle>
                                        操作
                                    </CardTitle>
                                    <CardBody>
                                        <Alert variant="warning" title="操作は順番に行ってください。" />
                                        <br />
                                        <Divider />
                                        <br />
                                        <Button
                                            variant="primary"
                                            isDisabled={isButtonDisabled}
                                            onClick={() => setButtonHandler()}
                                        >
                                            設定を保存
                                        </Button>
                                        <Progress
                                            value={SETcommandProgress}
                                            measureLocation={ProgressMeasureLocation.outside}
                                            variant={progressColor}
                                        />
                                        <br />
                                        <Divider />
                                        <br />
                                        <Button
                                            variant="primary"
                                            onClick={() => sendCompareCommand()}
                                            isDisabled={isButtonDisabled}
                                        >
                                            差分を表示
                                        </Button>
                                        <CodeBlock>
                                            <CodeBlockCode>
                                                {resultOfCompareCommand}
                                            </CodeBlockCode>
                                        </CodeBlock>
                                        <br />
                                        <Divider />
                                        <br />
                                        <Button
                                            variant="primary"
                                            onClick={() => sendCommitCommand()}
                                            isDisabled={isButtonDisabled}
                                        >
                                            設定を適用
                                        </Button>
                                        <p>設定の適用に数十秒かかります。この画面のまま「Commit Completed」と表示されるまでお待ちください。</p>
                                        <CodeBlock>
                                            <CodeBlockCode>
                                                {resultOfCommitCommand}
                                            </CodeBlockCode>
                                        </CodeBlock>
                                    </CardBody>
                                </>
                            ) : (
                                <Skeleton height='549px' screenreaderText='loading contents' />
                            )
                            }
                        </Card>
                    </StackItem>
                </Stack>
            </PageSection>
        </Layout>
    );
}

export default SateliteSelection;
