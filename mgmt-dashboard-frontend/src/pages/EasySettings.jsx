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
    TextInput
} from '@patternfly/react-core';
import { useState } from 'react';
import cockpit from '../cockpit/pkg/lib/cockpit';

function EasySettings() {
    const [isGetCommnadFinished, setIsGetCommnadFinished] = useState(false);


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mountpoint, setMountpoint] = useState('');
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [height, setHeight] = useState("");

    const cliPath = "~/rtk-base-station/mgmt-cli/mgmt-cli";
    const configPath = "~/rtk-base-station/config/";
    const sendGetCommand = async (key) => {
        setIsGetCommnadFinished(false);
        let res = undefined;
        await cockpit.script(`${cliPath} -c ${configPath} get ${key}`)
            .then(data => {
                res = data.slice(0, -1);
                setIsGetCommnadFinished(true);
                console.log(`[GET] ${key}: "${res}"`);
            }).catch(exception => {
                setIsGetCommnadFinished(false);
                console.error(`Failed to get ${key}`);
                console.error(exception);
            });
        return res;
    };

    useState(() => {
        (async () => {
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
                    isOpen={!isGetCommnadFinished}
                    showClose={false}
                    width="130px"
                >
                    <Button variant="tertiary"><Spinner /></Button>
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
                                            onChange={(_, value) => setUsername(value)}
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
                    </StackItem>
                </Stack>

            </PageSection>
        </Layout>
    );
}
export default EasySettings;