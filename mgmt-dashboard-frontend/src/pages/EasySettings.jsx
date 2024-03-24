//@ts-check
import Layout from '../layout';
import {
    Button,
    Card,
    CardBody,
    Stack,
    StackItem,
    Form,
    FormGroup,
    FormHelperText,
    HelperText,
    HelperTextItem,
    Modal,
    Spinner,
    Grid,
    GridItem,

    PageSection,
    TextInput,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import {
    sendDiscardCommand,
    sendGetCommand,
    sendSetCommand,
    sendCompareCommand,
    sendCommitCommand
} from '../utils/commands';
import { OperationPanel } from '../components/operationPanel';
import React from 'react';

function EasySettings() {

    const [numOfFinishedGetCommand, setnumOfFinishedGetCommand] = useState(0);

    const [username, setUsername] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));;
    const [password, setPassword] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));
    const [mountpoint, setMountpoint] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));
    const [latitude, setLatitude] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));
    const [longitude, setLongitude] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));
    const [height, setHeight] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));
    const [identifier, setIdentifier] = useState(
        /**
         * @type {string | undefined}
         */
        (undefined));


    const [buttonColor, setButtonColor] = useState(
        /**
         * @type {"primary" | "danger" | "link" | "tertiary" | "secondary" | "warning" | "plain" | "control" | undefined}
         */
        ('primary'));
    const [sendingCommandName, setSendingCommandName] = useState(
        /**
         * @type {"set" | "compare" | "commit" | "none"}
         */
        ("none"));
    const [resultOfSetCommand, setResultOfSetCommand] = useState('設定を保存ボタンを押してください');
    const [resultOfCompareCommand, setResultOfCompareCommand] = useState('差分を表示ボタンを押してください');
    const [resultOfCommitCommand, setResultOfCommitCommand] = useState('設定を適用ボタンを押してください');




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

            username == undefined
            || password == undefined
            || mountpoint == undefined
            || latitude == undefined
            || longitude == undefined
            || height == undefined
            || identifier == undefined

        ) {
            console.log("getコマンドが失敗しているkeyがあります");
            setResultOfSetCommand("設定の保存に失敗しました。")
            setSendingCommandName("none");
            setButtonColor("danger");
        } else {
            const commandList = [
                await sendSetCommand("Ntripcaster.Username", username),
                await sendSetCommand("Ntripcaster.Password", password),
                await sendSetCommand("Ntripcaster.Mountpoint", mountpoint),
                await sendSetCommand("Ntripcaster.Latitude", latitude),
                await sendSetCommand("Ntripcaster.Longitude", longitude),
                await sendSetCommand("Ntripcaster.Height", height),
                await sendSetCommand("Ntripcaster.Sourcetable.Identifier", identifier),
            ];
    
            let failed = false;
            for(let i = 0; i < commandList.length; i++){
                const res = commandList[i];
                if(res != null){
                    failed = true;
                    setButtonColor("danger");
                    setSendingCommandName("none");
                    setResultOfSetCommand("エラーが発生しました: " + res.message);
                    break;
                }
            }
    
            if(!failed){
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
        if(res == null){
            setSendingCommandName("none");
            setButtonColor("primary");
        } else {
            setResultOfCommitCommand(resultOfCommitCommand => resultOfCommitCommand + "エラーが発生しました: " + res.message);
            setSendingCommandName("none");
            setButtonColor("danger");
        }

    };

    // 下のuseEffectで実行するコマンド数
    const numOfItems = 8;
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
                [setUsername, await sendGetCommand("Ntripcaster.Username")],
                [setPassword, await sendGetCommand("Ntripcaster.Password")],
                [setMountpoint, await sendGetCommand("Ntripcaster.Mountpoint")],
                [setLatitude, await sendGetCommand("Ntripcaster.Latitude")],
                [setLongitude, await sendGetCommand("Ntripcaster.Longitude")],
                [setHeight, await sendGetCommand("Ntripcaster.Height")],
                [setIdentifier, await sendGetCommand("Ntripcaster.Sourcetable.Identifier")],
            ];
            for(let i = 0; i < commands.length; i++){
                const res = commands[i][1];
                if(res === Error){
                    console.error("getコマンドが失敗しているkeyがあります");
                    break;
                } else if (res === undefined){
                    // あり得ない
                } else {
                    commands[i][0](res);
                    setnumOfFinishedGetCommand(numOfFinishedGetCommand => numOfFinishedGetCommand + 1);
                }
            }
        })()
    }, [])


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
                                <Form>
                                    <FormGroup label="接続用ユーザ名">
                                        <TextInput
                                            value={username}
                                            onChange={(_, value) => setUsername(value)}
                                            id="username"
                                        />
                                        <FormHelperText>
                                            <HelperText>
                                                <HelperTextItem>空欄の場合、設定なしです。</HelperTextItem>
                                            </HelperText>
                                        </FormHelperText>
                                    </FormGroup>
                                    <FormGroup label="接続用パスワード">
                                        <TextInput
                                            value={password}
                                            onChange={(_, value) => setPassword(value)}
                                            id="password"
                                        />
                                        <FormHelperText>
                                            <HelperText>
                                                <HelperTextItem>空欄の場合、設定なしです。</HelperTextItem>
                                            </HelperText>
                                        </FormHelperText>
                                    </FormGroup>
                                    <FormGroup label="マウントポイント名">
                                        <TextInput
                                            value={mountpoint}
                                            onChange={(_, value) => setMountpoint(value)}
                                            id="mountpoint"
                                        />
                                    </FormGroup>
                                    <Grid hasGutter>
                                        <GridItem span={4}>
                                            <FormGroup label="緯度">
                                                <TextInput
                                                    value={latitude}
                                                    onChange={(_, value) => setLatitude(value)}
                                                    id="latitude"
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>小数第8位程度まで入力することをお勧めします。</HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </GridItem>
                                        <GridItem span={4}>
                                            <FormGroup label="経度">
                                                <TextInput
                                                    value={longitude}
                                                    onChange={(_, value) => setLongitude(value)}
                                                    id="longitude"
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>小数第8位程度まで入力することをお勧めします。</HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </GridItem>
                                        <GridItem span={4}>
                                            <FormGroup label="高度">
                                                <TextInput
                                                    value={height}
                                                    onChange={(_, value) => setHeight(value)}
                                                    id="height"
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>小数第4位程度まで入力することをお勧めします。</HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </GridItem>
                                    </Grid>
                                    <FormGroup label="Identifier">
                                        <TextInput
                                            value={identifier}
                                            onChange={(_, value) => setIdentifier(value)}
                                            id="identifier"
                                        />
                                        <FormHelperText>
                                            <HelperText>
                                                <HelperTextItem>都市名を英語で設定するのが慣習です。</HelperTextItem>
                                            </HelperText>
                                        </FormHelperText>
                                    </FormGroup>
                                </Form>
                            </CardBody>
                        </Card>
                        <br />
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
export default EasySettings;