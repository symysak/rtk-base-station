import Layout from '../layout';
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardTitle,
    CodeBlock,
    CodeBlockCode,
    Divider,
    Stack,
    StackItem,
    Form,
    FormGroup,
    FormHelperText,
    HelperText,
    HelperTextItem,
    Modal,
    Progress,
    ProgressMeasureLocation,
    Spinner,
    Grid,
    GridItem,

    PageSection,
    TextInput,
    WizardStep
} from '@patternfly/react-core';
import { useEffect, useState, useReducer } from 'react';
import cockpit from '../cockpit/pkg/lib/cockpit';

function EasySettings() {
    const [any, forceUpdate] = useReducer(num => num + 1, 0);

    const [numOfFinishedGetCommand, setnumOfFinishedGetCommand] = useState(0);
    const [numOfFinishedSetCommand, setNumOfFinishedSetCommand] = useState(0);

    const [username, setUsername] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [mountpoint, setMountpoint] = useState(undefined);
    const [latitude, setLatitude] = useState(undefined);
    const [longitude, setLongitude] = useState(undefined);
    const [height, setHeight] = useState(undefined);


    const [progressColor, setProgressColor] = useState('primary');
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [sendingSetCommandNow, setSendingSetCommandNow] = useState(false);
    const [resultOfSetCommand, setResultOfSetCommand] = useState('設定を保存ボタンを押してください');
    const [resultOfCompareCommand, setResultOfCompareCommand] = useState('差分を表示ボタンを押してください');
    const [resultOfCommitCommand, setResultOfCommitCommand] = useState('設定を適用ボタンを押してください');


    const cliPath = "~/rtk-base-station/mgmt-cli/mgmt-cli";
    const configPath = "~/rtk-base-station/config/";
    const sendDiscardCommand = async () => {
        await cockpit.script(`${cliPath} -c ${configPath} discard`)
            .then(data => {
                console.log("[DISCARD] " + data);
                setnumOfFinishedGetCommand(numOfFinishedGetCommand => numOfFinishedGetCommand + 1);
            }).catch(exception => {
                console.error(`Failed to discard`);
                console.error(exception);
            });
    };

    const sendGetCommand = async (key) => {
        let res = undefined;
        await cockpit.script(`${cliPath} -c ${configPath} get ${key}`)
            .then(data => {
                res = data.slice(0, -1);
                setnumOfFinishedGetCommand(numOfFinishedGetCommand => numOfFinishedGetCommand + 1);
                console.log(`[GET] ${key}: "${res}"`);
            }).catch(exception => {
                console.error(`Failed to get ${key}`);
                console.error(exception);
            });
        return res;
    };

    const sendSetCommand = async (key, value) => {
        let res = undefined;
        await cockpit.script(`${cliPath} -c ${configPath} set ${key} "${value}"`)
            .then(data => {
                console.log("[SET] " + data);
                res = null;
            }).catch(exception => {
                console.error(`Failed to set ${key} ${value}`);
                res = exception;
            });
        return res;
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
                setResultOfCommitCommand(resultOfCommitCommand => resultOfCommitCommand + "エラーが発生しました: " + exception);
                setIsButtonDisabled(false);
            });
    };

    const setButtonHandler = async () => {
        setSendingSetCommandNow(true);
        setNumOfFinishedSetCommand(0);
        setIsButtonDisabled(true);
        setProgressColor("primary");
        if (

            username == undefined
            || password == undefined
            || mountpoint == undefined
            || latitude == undefined
            || longitude == undefined
            || height == undefined

        ) {
            console.log("getコマンドが失敗しているkeyがあります");
            setResultOfSetCommand("設定の保存に失敗しました。")
            setIsButtonDisabled(false);
            setSendingSetCommandNow(false);
        } else {
            const commandList = [
                await sendSetCommand("Ntripcaster.Username", username),
                await sendSetCommand("Ntripcaster.Password", password),
                await sendSetCommand("Ntripcaster.Mountpoint", mountpoint),
                await sendSetCommand("Ntripcaster.Latitude", latitude),
                await sendSetCommand("Ntripcaster.Longitude", longitude),
                await sendSetCommand("Ntripcaster.Height", height),
            ];
    
            let failed = false;
            for(let i = 0; i < commandList.length; i++){
                const res = commandList[i];
                if(res != null){
                    failed = true;
                    setProgressColor("danger");
                    setIsButtonDisabled(false);
                    setSendingSetCommandNow(false);
                    setResultOfSetCommand("エラーが発生しました: " + res.message);
                    break;
                }
                setNumOfFinishedSetCommand(numOfFinishedSetCommand => numOfFinishedSetCommand + 1);
            }
    
            if(!failed){
                setIsButtonDisabled(false);
                setSendingSetCommandNow(false);
                setResultOfSetCommand("設定を保存しました。");
            }
        }
    }

    // getしたりsetしたりするKeyの数
    const numOfItems = 7;
    useState(() => {
        (async () => {
            await sendDiscardCommand();
            setUsername(await sendGetCommand("Ntripcaster.Username"));
            setPassword(await sendGetCommand("Ntripcaster.Password"));
            setMountpoint(await sendGetCommand("Ntripcaster.Mountpoint"));
            setLatitude(await sendGetCommand("Ntripcaster.Latitude"));
            setLongitude(await sendGetCommand("Ntripcaster.Longitude"));
            setHeight(await sendGetCommand("Ntripcaster.Height"));
        })()
    }, [])


    return (
        <Layout>
            <PageSection>
                <Modal
                    isOpen={numOfFinishedGetCommand != numOfItems}
                    showClose={false}
                    width="70%"
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
                                        />
                                    </FormGroup>
                                    <Grid hasGutter>
                                        <GridItem span={4}>
                                            <FormGroup label="緯度">
                                                <TextInput
                                                    value={latitude}
                                                    onChange={(_, value) => setLatitude(value)}
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>小数第8位程度での入力をお勧めします。</HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </GridItem>
                                        <GridItem span={4}>
                                            <FormGroup label="経度">
                                                <TextInput
                                                    value={longitude}
                                                    onChange={(_, value) => setLongitude(value)}
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>小数第8位程度での入力をお勧めします。</HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </GridItem>
                                        <GridItem span={4}>
                                            <FormGroup label="高度">
                                                <TextInput
                                                    value={height}
                                                    onChange={(_, value) => setHeight(value)}
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>小数第4位程度での入力をお勧めします。</HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </GridItem>
                                    </Grid>
                                </Form>
                            </CardBody>
                        </Card>
                        <br />
                        <Card>
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
                                <CodeBlock>
                                    <CodeBlockCode>
                                        {resultOfSetCommand}
                                    </CodeBlockCode>
                                </CodeBlock>
                                <Modal
                                    isOpen={sendingSetCommandNow}
                                    showClose={false}
                                    width="70%"
                                >
                                    <Button variant="tertiary"><Spinner /></Button>
                                </Modal>
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
                        </Card>
                    </StackItem>
                </Stack>

            </PageSection>
        </Layout>
    );
}
export default EasySettings;