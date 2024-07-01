//@ts-check
import React from 'react';
import Layout from '../layout';
import { PageSection, TextContent, Title } from '@patternfly/react-core';

const Status = () => {

    return (
        <Layout>
            <PageSection>
                <Title headingLevel='h1' style={{color:"red"}}>試験的実装ページ</Title>
                <p style={{color:"red"}}>主に、試験的に試してみたいプログラムコード置き場
                    本実装時には本コードおよびそれにかかわるプログラム等はすべて削除しておく
                </p>
                    
            </PageSection>
        </Layout>
    );
};
export default Status;