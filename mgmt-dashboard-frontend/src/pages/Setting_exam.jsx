//@ts-check
import React from 'react';
import { useEffect, useState } from 'react';
import {
    Card,
    CardTitle,
    CardBody,
    Panel,
    PanelMain,
    PanelMainBody,
    PanelHeader,
    Divider,
    Switch,
    Stack,
    StackItem,
    PageSection,
    Modal,
    Button,
    Spinner,
    Title,
    Select, SelectOption, SelectList, MenuToggle,
    TextContent,
    Slider,
    TextVariants,
} from '@patternfly/react-core';
import '@patternfly/react-core/dist/styles/base.css';
import Layout from '../layout';
import { OperationPanel } from '../components/operationPanel';
import {
    sendDiscardCommand,
    sendSetCommand,
    sendGetCommand,
    sendCompareCommand,
    sendCommitCommand
} from '../utils/commands';


function Status() {

    const [buttonColor, setButtonColor] = useState(
        /**
          @type {"primary" | "danger" | "link" | "tertiary" | "secondary" | "warning" | "plain" | "control" | undefined}
         */
        ('primary'));
    const [sendingCommandName, setSendingCommandName] = useState(
        /**
         * @type {"set" | "compare" | "commit" | "none"}
         */
        ("none"));
    const [resultOfSetCommand, setResultOfSetCommand] = useState(
        /**
         * @type {string}
         */
        ('設定を保存ボタンを押してください'));
    const [resultOfCompareCommand, setResultOfCompareCommand] = useState(
        /**
         * @type {string}
         */
        ('差分を表示ボタンを押してください'));
    const [resultOfCommitCommand, setResultOfCommitCommand] = useState(
        /**
         * @type {string}
         */
        ('設定を適用ボタンを押してください'));

    const [numOfFinishedGetCommand, setnumOfFinishedGetCommand] = useState(0);

    // ここからConfig関連のstate
    const [saveConfig, setSaveConfig] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

    const [GpsEnabled, setGpsEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [GpsL1caEnabled, setGpsL1caEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [GpsL2cEnabled, setGpsL2cEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

    const [SbasEnabled, setSbasEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [SbasL1caEnabled, setSbasL1caEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

    const [GalileoEnabled, setGalileoEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [GalileoE1Enabled, setGalileoE1Enabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [GalileoE5bEnabled, setGalileoE5bEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

    const [BeidoEnabled, setBeidoEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [BeidoB1Enabled, setBeidoB1Enabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [BeidoB2Enabled, setBeidoB2Enabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

    const [QzssEnabled, setQzssEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [QzssL1caEnabled, setQzssL1caEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [QzssL1sEnabled, setQzssL1sEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [QzssL2cEnabled, setQzssL2cEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

    const [GlonassEnabled, setGlonassEnabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [GlonassL1Enabled, setGlonassL1Enabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));
    const [GlonassL2Enabled, setGlonassL2Enabled] = useState(
        /**
         * @type {boolean | undefined}
         */
        (undefined));

        const [isOpen, setIsOpen] = React.useState(false);
        const [selected, setSelected] = React.useState(
            /**
              @type {"Satelite1" | "Satelite2" | "Satelite3" | "undefined"}
             */
            ('undefined'));
        const [isDisabled, setIsDisabled] = React.useState(false);
        const onToggleClick = () => {
            setIsOpen(!isOpen);
        };
        const onSelect = (_event, value) => {
            console.log('selected', value);
            setSelected(value);
            setIsOpen(false);
        };
        const toggle = toggleRef => <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isDisabled={isDisabled} style={{
            width: '200px'
        }}>
            {selected}
            </MenuToggle>;

    // ここまでConfig関連のstate

    /*
        ハンドラーの処理で考慮すべきこと
        1. command実行中は、多重実行を避けるためにボタンをdisabledにすること。
        2. command実行中は、ボタンの色を以下のように変更すること。
            1. ハンドラーが呼ばれたら、primary
            2. commandが成功したら、success
            3. commandが失敗したら、primary
    */
    const setButtonHandler = async () => {
        setSendingCommandName("set");
        setButtonColor("primary");
        if (

            saveConfig == undefined ||
            
            GpsEnabled == undefined ||
            GpsL1caEnabled == undefined ||
            GpsL2cEnabled == undefined ||

            SbasEnabled == undefined ||
            SbasL1caEnabled == undefined ||

            GalileoEnabled == undefined ||
            GalileoE1Enabled == undefined ||
            GalileoE5bEnabled == undefined ||

            BeidoEnabled == undefined ||
            BeidoB1Enabled == undefined ||
            BeidoB2Enabled == undefined ||

            QzssEnabled == undefined ||
            QzssL1caEnabled == undefined ||
            QzssL1sEnabled == undefined ||
            QzssL2cEnabled == undefined ||

            GlonassEnabled == undefined ||
            GlonassL1Enabled == undefined ||
            GlonassL2Enabled == undefined

        ) {
            console.log("getコマンドが失敗しているkeyがあります");
            setResultOfSetCommand("設定の保存に失敗しました。")
            setSendingCommandName("none");
            setButtonColor("danger");
        } else {
            const commandList = [
                await sendSetCommand("UbloxReceiver.SaveConfig", saveConfig),

                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GPS.ENA", GpsEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L1CA_ENA", GpsL1caEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L2C_ENA", GpsL2cEnabled),

                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.ENA", SbasEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.L1CA_ENA", SbasL1caEnabled),

                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GAL.ENA", GalileoEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E1_ENA", GalileoE1Enabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E5B_ENA", GalileoE5bEnabled),

                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.BDS.ENA", BeidoEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B1_ENA", BeidoB1Enabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B2_ENA", BeidoB2Enabled),

                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.ENA", QzssEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1CA_ENA", QzssL1caEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1S_ENA", QzssL1sEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L2C_ENA", QzssL2cEnabled),

                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GLO.ENA", GlonassEnabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L1_ENA", GlonassL1Enabled),
                await sendSetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L2_ENA", GlonassL2Enabled),

            ];

            let failed = false;
            for (let i = 0; i < commandList.length; i++) {
                const res = commandList[i];
                if (res != null) {
                    failed = true;
                    setButtonColor("danger");
                    setSendingCommandName("none");
                    setResultOfSetCommand("エラーが発生しました: " + res.message);
                    break;
                }
            }

            if (!failed) {
                setSendingCommandName("none");
                setButtonColor("primary");
                setResultOfSetCommand("設定を保存しました。");
            }
        }
    }

    const compareButtonHandlar = async () => {
        setSendingCommandName("compare");
        setButtonColor("primary");
        const res = await sendCompareCommand();
        if (res === undefined) {
            // あり得ない
        } else if (res instanceof Error) {
            setResultOfCompareCommand("エラーが発生しました: " + res.message);
            setSendingCommandName("none");
            setButtonColor("danger");
        } else {
            setResultOfCompareCommand(res);
            setSendingCommandName("none");
            setButtonColor("primary");
        }
    };

    const commitButtonHandlar = async () => {
        setSendingCommandName("commit");
        setResultOfCommitCommand("");
        setButtonColor("primary");
        const res = await sendCommitCommand(setResultOfCommitCommand);
        if (res == null) {
            setSendingCommandName("none");
            setButtonColor("primary");
        } else {
            setResultOfCommitCommand(resultOfCommitCommand => resultOfCommitCommand + "エラーが発生しました: " + res.message);
            setSendingCommandName("none");
            setButtonColor("danger");
        }

    };

    // 下のuseEffectで実行するコマンド数
    const numOfItems = 20;
    useEffect(() => {
        (async () => {
            // running-configとweb設定画面の同期を取るために、最初にdiscardを実行する
            // setコマンドを実行しただけだと、new-configにしか反映されず、running-configを使用するgetコマンドを実行した際に画面に差異が生じる
            await sendDiscardCommand()
            setnumOfFinishedGetCommand(numOfFinishedGetCommand => numOfFinishedGetCommand + 1);
            /**
             * @type {Array<[React.Dispatch<any>, any]>}
             */
            const commands = [
                [setSaveConfig, await sendGetCommand("UbloxReceiver.SaveConfig")],

                [setGpsEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GPS.ENA")],
                [setGpsL1caEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L1CA_ENA")],
                [setGpsL2cEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GPS.L2C_ENA")],

                [setSbasEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.ENA")],
                [setSbasL1caEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.SBAS.L1CA_ENA")],

                [setGalileoEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GAL.ENA")],
                [setGalileoE1Enabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E1_ENA")],
                [setGalileoE5bEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GAL.E5B_ENA")],

                [setBeidoEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.BDS.ENA")],
                [setBeidoB1Enabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B1_ENA")],
                [setBeidoB2Enabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.BDS.B2_ENA")],

                [setQzssEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.ENA")],
                [setQzssL1caEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1CA_ENA")],
                [setQzssL1sEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L1S_ENA")],
                [setQzssL2cEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.QZSS.L2C_ENA")],

                [setGlonassEnabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GLO.ENA")],
                [setGlonassL1Enabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L1_ENA")],
                [setGlonassL2Enabled, await sendGetCommand("UbloxReceiver.CFG.SIGNAL.GLO.L2_ENA")],

            ];
            for(let i = 0; i < commands.length; i++){
                const res = commands[i][1];
                if(res === Error){
                    console.error("getコマンドが失敗しているkeyがあります");
                    break;
                } else if (res === undefined){
                    // あり得ない
                } else {
                    if (res == "true") {
                        commands[i][0](true);
                    } else if (res == "false") {
                        commands[i][0](false);
                    } else {
                        console.error("getコマンドの結果が不正です");
                    }
                    setnumOfFinishedGetCommand(numOfFinishedGetCommand => numOfFinishedGetCommand + 1);
                }
            }
        })()
    }, []);
    

    
    return (
        <Layout>
            <PageSection>
                <Modal
                    isOpen={numOfFinishedGetCommand != numOfItems}
                    showClose={false}
                    width="70%"
                    aria-label='Loading...'
                >
                    <Button variant="tertiary"><Spinner /></Button>
                    <br />
                    <p>10数秒経ってもこの表示が消えない場合、このページを再読み込みしてください。</p>
                </Modal>
                <Stack>
                    <StackItem>
                        <Card>
                            <CardBody>
                            <Title headingLevel='h1' style={{color:"red"}}>試験的実装ページ</Title>
                                <p style={{color:"red"}}>主に、試験的に試してみたいプログラムコード置き場
                                本実装時には本コードおよびそれにかかわるプログラム等はすべて削除しておくこと
                                </p>
                            </CardBody>
                        </Card>
                    </StackItem>

                    <br />

                    <StackItem>
                        <Card>
                            <CardBody>
                                <CardTitle>Command Test Area</CardTitle>
                                <Select id="single-select" isOpen={isOpen} selected={selected} onSelect={onSelect} onOpenChange={isOpen => setIsOpen(isOpen)} toggle={toggle} shouldFocusToggleOnSelect>
                                <SelectList>
                                <SelectOption value="Satelite1">Satelite1</SelectOption>
                                <SelectOption value="Satelite2">Satelite2</SelectOption>
                                <SelectOption value="Satelite3">Satelite3</SelectOption>
                                </SelectList>
                                </Select>
                            </CardBody>
                            
                        </Card>
                    </StackItem>

                    <br />

                    <StackItem>
                        <Card>
                            <CardBody>
                                <Switch
                                    label="設定を再起動後も保存する"
                                    isChecked={saveConfig == undefined ? false : saveConfig}
                                    onChange={() => setSaveConfig(!saveConfig)}
                                    ouiaId="BasicSwitch"
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
                                            />
                                            <br />
                                            <Switch
                                                label="L2C"
                                                isChecked={GpsL2cEnabled == undefined ? false : GpsL2cEnabled}
                                                onChange={() => setGpsL2cEnabled(!GpsL2cEnabled)}
                                                ouiaId="BasicSwitch"
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
                                            />
                                            <br />
                                            <Switch
                                                label="E5b"
                                                isChecked={GalileoE5bEnabled == undefined ? false : GalileoE5bEnabled}
                                                onChange={() => setGalileoE5bEnabled(!GalileoE5bEnabled)}
                                                ouiaId="BasicSwitch"
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
                                            />
                                            <br />
                                            <Switch
                                                label="B2"
                                                isChecked={BeidoB2Enabled == undefined ? false : BeidoB2Enabled}
                                                onChange={() => setBeidoB2Enabled(!BeidoB2Enabled)}
                                                ouiaId="BasicSwitch"
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
                                            />
                                            <br />
                                            <Switch
                                                label="L1S"
                                                isChecked={QzssL1sEnabled == undefined ? false : QzssL1sEnabled}
                                                onChange={() => setQzssL1sEnabled(!QzssL1sEnabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="L2C"
                                                isChecked={QzssL2cEnabled == undefined ? false : QzssL2cEnabled}
                                                onChange={() => setQzssL2cEnabled(!QzssL2cEnabled)}
                                                ouiaId="BasicSwitch"
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
                                            />
                                            <br />
                                            <Switch
                                                label="L2"
                                                isChecked={GlonassL2Enabled == undefined ? false : GlonassL2Enabled}
                                                onChange={() => setGlonassL2Enabled(!GlonassL2Enabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                        </PanelMainBody>
                                    </PanelMain>
                                </Panel>

                            </CardBody>
                        </Card>
                    </StackItem>

                    <br />

                    <StackItem>
                        <OperationPanel
                            buttonColor={buttonColor}
                            sendingCommandName={sendingCommandName}
                            setButtonHandler={setButtonHandler}
                            resultOfSetCommand={resultOfSetCommand}
                            compareButtonHandlar={compareButtonHandlar}
                            resultOfCompareCommand={resultOfCompareCommand}
                            commitButtonHandlar={commitButtonHandlar}
                            resultOfCommitCommand={resultOfCommitCommand}
                        />
                    </StackItem>
                </Stack>
            </PageSection>
        </Layout>
    );
}
export default Status;