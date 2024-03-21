import Layout from '../layout';
import {
    Button,
    Card,
    CardBody,
    Stack,
    StackItem,
    FormGroup,
    FormHelperText,
    HelperText,
    HelperTextItem,
    Modal,
    Spinner,

    PageSection,
    TextInput
} from '@patternfly/react-core';
import { useState } from 'react';
import cockpit from '../cockpit/pkg/lib/cockpit';

function EasySettings() {
    const [isGetCommnadFinished, setIsGetCommnadFinished] = useState(false);


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const cliPath = "~/rtk-base-station/mgmt-cli/mgmt-cli";
    const configPath = "~/rtk-base-station/config/";
    const sendGetCommand = async (key) => {
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
                            </CardBody>
                        </Card>
                    </StackItem>
                </Stack>

            </PageSection>
        </Layout>
    );
}
export default EasySettings;