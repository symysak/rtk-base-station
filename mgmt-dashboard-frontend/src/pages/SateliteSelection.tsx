import React from 'react'

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
    const [saveConfig, setSaveConfig] = React.useState(false);

    const [GpsEnabled, setGpsEnabled] = React.useState(false);
    const [GpsL1caEnabled, setGpsL1caEnabled] = React.useState(false);
    const [GpsL2cEnabled, setGpsL2cEnabled] = React.useState(false);

    const [SbasEnabled, setSbasEnabled] = React.useState(false);
    const [SbasL1caEnabled, setSbasL1caEnabled] = React.useState(false);

    const [GalileoEnabled, setGalileoEnabled] = React.useState(false);
    const [GalileoE1Enabled, setGalileoE1Enabled] = React.useState(false);
    const [GalileoE5bEnabled, setGalileoE5bEnabled] = React.useState(false);

    const [BeidoEnabled, setBeidoEnabled] = React.useState(false);
    const [BeidoB1Enabled, setBeidoB1Enabled] = React.useState(false);
    const [BeidoB2Enabled, setBeidoB2Enabled] = React.useState(false);

    const [QzssEnabled, setQzssEnabled] = React.useState(false);
    const [QzssL1caEnabled, setQzssL1caEnabled] = React.useState(false);
    const [QzssL1sEnabled, setQzssL1sEnabled] = React.useState(false);
    const [QzssL2cEnabled, setQzssL2cEnabled] = React.useState(false);

    const [GlonassEnabled, setGlonassEnabled] = React.useState(false);
    const [GlonassL1Enabled, setGlonassL1Enabled] = React.useState(false);
    const [GlonassL2Enabled, setGlonassL2Enabled] = React.useState(false);
    // ここまでConfig関連のstate

    const [isGetCommandComplete, setIsGetCommandComplete] = React.useState(!false);
    const [resultOfCompareCommand, setResultOfCompareCommand] = React.useState('差分を表示ボタンを押してください');
    const [resultOfCommitCommand, setResultOfCommitCommand] = React.useState('設定を適用ボタンを押してください');




    return (
        <Layout>
            <PageSection>
                <Stack>

                    <StackItem>
                        <Card>
                            <CardBody>
                                <Switch
                                    label="設定を再起動後も保存する"
                                    isChecked={saveConfig}
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
                                            isChecked={GpsEnabled}
                                            onChange={() => setGpsEnabled(!GpsEnabled)}
                                            ouiaId="BasicSwitch"
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1CA"
                                                isChecked={GpsL1caEnabled}
                                                onChange={() => setGpsL1caEnabled(!GpsL1caEnabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="L2C"
                                                isChecked={GpsL2cEnabled}
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
                                            isChecked={SbasEnabled}
                                            onChange={() => setSbasEnabled(!SbasEnabled)}
                                            ouiaId="BasicSwitch"
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1CA"
                                                isChecked={SbasL1caEnabled}
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
                                            isChecked={GalileoEnabled}
                                            onChange={() => setGalileoEnabled(!GalileoEnabled)}
                                            ouiaId="BasicSwitch"
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="E1"
                                                isChecked={GalileoE1Enabled}
                                                onChange={() => setGalileoE1Enabled(!GalileoE1Enabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="E5b"
                                                isChecked={GalileoE5bEnabled}
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
                                            isChecked={BeidoEnabled}
                                            onChange={() => setBeidoEnabled(!BeidoEnabled)}
                                            ouiaId="BasicSwitch"
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="B1"
                                                isChecked={BeidoB1Enabled}
                                                onChange={() => setBeidoB1Enabled(!BeidoB1Enabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="B2"
                                                isChecked={BeidoB2Enabled}
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
                                            isChecked={QzssEnabled}
                                            onChange={() => setQzssEnabled(!QzssEnabled)}
                                            ouiaId="BasicSwitch"
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1CA"
                                                isChecked={QzssL1caEnabled}
                                                onChange={() => setQzssL1caEnabled(!QzssL1caEnabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="L1S"
                                                isChecked={QzssL1sEnabled}
                                                onChange={() => setQzssL1sEnabled(!QzssL1sEnabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="L2C"
                                                isChecked={QzssL2cEnabled}
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
                                            isChecked={GlonassEnabled}
                                            onChange={() => setGlonassEnabled(!GlonassEnabled)}
                                            ouiaId="BasicSwitch"
                                        />
                                    </PanelHeader>
                                    <Divider />
                                    <PanelMain>
                                        <PanelMainBody>
                                            <Switch
                                                label="L1"
                                                isChecked={GlonassL1Enabled}
                                                onChange={() => setGlonassL1Enabled(!GlonassL1Enabled)}
                                                ouiaId="BasicSwitch"
                                            />
                                            <br />
                                            <Switch
                                                label="L2"
                                                isChecked={GlonassL2Enabled}
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
                        <Card>
                            {isGetCommandComplete ? (
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
                                        >
                                            設定を保存
                                        </Button>
                                        <Progress
                                            value={33}
                                            measureLocation={ProgressMeasureLocation.outside}
                                            variant={ProgressVariant.success}
                                        />
                                        <br />
                                        <Divider />
                                        <br />
                                        <Button
                                            variant="primary"
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
                                        >
                                            設定を適用
                                        </Button>
                                        <CodeBlock>
                                            <CodeBlockCode>
                                                {resultOfCommitCommand}
                                            </CodeBlockCode>
                                        </CodeBlock>
                                    </CardBody>
                                </>
                            ) : (
                                <Skeleton height='300px' screenreaderText='loading contents' />
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
