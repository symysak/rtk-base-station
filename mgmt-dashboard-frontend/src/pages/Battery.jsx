import React from 'react';
import Layout from '../layout';
import { StackItem,FlexItem,PageSection, Alert ,Grid,GridItem,Stack,Button, Card,ActionGroup, CardTitle, CardBody, CardFooter,Title,Slider,TextInput,Form, FormGroup,Progress, ProgressSize} from '@patternfly/react-core';
import { ProgressStepper, ProgressStep } from '@patternfly/react-core';
import { zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
const schema = z.object({
    age: z.number().min(20, "20以上である必要があります").max(100, "100以下である必要があります"),
  });
const Status = () => {

    const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // zodResolver関数を使って、バリデーション用のリゾルバを作成し、
    // そのまま作成したリゾルバを渡します
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };
  const errorStyle = {
    color: "red",
  };

    const [ShutdownValue, setShutdownValue] = React.useState(50);
    const [inputShutdownValue, setInputShutdownValue] = React.useState(50);
    const onChangeShutdownValue = (_event, value, inputValue, setLocalInputValue) => {
        let newValue;
        if (inputValue === undefined) {
            newValue = Math.floor(value);
        } else {
            if (inputValue > 100) {
                newValue = 100;
                setLocalInputValue(100);
            } else if (inputValue < 0) {
                newValue = 0;
                setLocalInputValue(0);
            } else {
                newValue = Math.floor(inputValue);
            }
        }
        setInputShutdownValue(newValue);
        setShutdownValue(newValue);
    };
    const [name, setName] = React.useState('30');
    const handleNameChange = (_event, name) => {
    setName(name);
  };
    return (
        <Layout>
            <PageSection>
                <Stack>
                    <Card>
                    <CardBody>
                        <Grid hasGutter>
                            <GridItem span={5} rowSpan={1}>
                                <Title headingLevel='h2' size='lg'>UPSバッテリー状況</Title>
                            </GridItem>
                            <GridItem span={4} rowSpan={2}>
                                    <Form>
                                        <Title headingLevel='h2' size='lg'>
                                        UPS詳細設定
                                        </Title>
                                        <FormGroup label='起動バッテリー残量'>
                                            <Slider value={ShutdownValue} isInputVisible inputValue={inputShutdownValue} inputLabel="%" onChange={onChangeShutdownValue} />
                                        </FormGroup>
                                    </Form>
                            </GridItem>
                            <GridItem span={5} rowSpan={1}>
                                    <Alert variant="success" title="UPS動作中" ouiaId="SuccessAlert" />
                            </GridItem>
                            <GridItem span={5} rowSpan={2}>
                                <Progress value={33} title="バッテリー残量" size={ProgressSize.lg} />
                            </GridItem>
                            <GridItem span={4} rowSpan={2}>
                                <Form onChange={handleSubmit(onSubmit)}>
                                    <FormGroup label='自動シャットダウンまでの秒数'onChange={handleNameChange}>
                                    <TextInput id="age" name="age" type='number' aria-describedby="age" value={name} {...register("age", { valueAsNumber: true })}/>
                                    {errors.age && <span style={errorStyle}>{errors.age.message}</span>}
                                    </FormGroup>
                                    <ActionGroup>
                                        <Button variant="primary">更新</Button>
                                    </ActionGroup>
                                </Form>
                            </GridItem>
                        </Grid>
                        </CardBody>
                    </Card>
                </Stack>
            </PageSection>
        </Layout>
    );
};
export default Status;