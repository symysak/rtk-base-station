//@ts-check
import React from 'react';
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    Alert,
    Divider,
    CodeBlock,
    CodeBlockCode,
} from '@patternfly/react-core';

/**
 * 
 * @param {{
 *  buttonColor: "primary" | "danger" | "link" | "tertiary" | "secondary" | "warning" | "plain" | "control" | undefined,
 *  sendingCommandName: "none" | "set" | "compare" | "commit",
 *  setButtonHandler: Function,
 *  resultOfSetCommand: string,
 *  compareButtonHandlar: Function,
 *  resultOfCompareCommand: string,
 *  commitButtonHandlar: Function,
 *  resultOfCommitCommand: string
 * }} props
 * @returns 
 */
export const OperationPanel = ({buttonColor, sendingCommandName, setButtonHandler, resultOfSetCommand, compareButtonHandlar, resultOfCompareCommand, commitButtonHandlar, resultOfCommitCommand}) => {

    return (
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
                    variant={buttonColor}
                    isDisabled={sendingCommandName !== "none"}
                    isLoading={sendingCommandName === "set"}
                    onClick={() => setButtonHandler()}
                >
                    設定を保存
                </Button>
                <CodeBlock>
                    <CodeBlockCode>
                        {resultOfSetCommand}
                    </CodeBlockCode>
                </CodeBlock>
                <br />
                <Divider />
                <br />
                <Button
                    variant={buttonColor}
                    onClick={() => compareButtonHandlar()}
                    isDisabled={sendingCommandName !== "none"}
                    isLoading={sendingCommandName === "compare"}
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
                    variant={buttonColor}
                    onClick={() => commitButtonHandlar()}
                    isDisabled={sendingCommandName !== "none"}
                    isLoading={sendingCommandName === "commit"}
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
    );
};