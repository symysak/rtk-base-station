import React from 'react';
import Layout from '../layout';
import { PageSection, Alert } from '@patternfly/react-core';

const Status = () => {

    return (
        <Layout>
            <PageSection width={200}>
                <p>将来的には正常に動作しているかなどを表示するページにする予定</p>
                <Alert title="Custom alert title" ouiaId="CustomAlert" width={200}/>
            </PageSection>
        </Layout>
    );
};
export default Status;