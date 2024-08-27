import React from 'react';
import { Alert, PageSection } from '@patternfly/react-core';
import {Select, SelectOption, SelectList, MenuToggle} from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import Layout from '../layout';
const Status = () => {
  const [isOpen1, setIsOpen1] = React.useState(false);
  const [selected1, setSelected1] = React.useState('Select a value');
  const onToggleClick = () => {
    setIsOpen1(!isOpen1);
  };
  const onSelect = (_event, value) => {
    console.log('selected', value);
    setSelected1(value);
    setIsOpen1(false);
  };
  const toggle1 = toggleRef => <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen1} style={{
    width: '200px'
  }}>
      {selected1}
    </MenuToggle>;
  return (
    <Layout>
        <PageSection>
        <Select id="option-variations-select" isOpen={isOpen1} selected={selected1} onSelect={onSelect} onOpenChange={isOpen1 => setIsOpen1(isOpen1)} toggle={toggle1} shouldFocusToggleOnSelect>
        <SelectList>
        <SelectOption value="Basic option">Basic option</SelectOption>
        <SelectOption value="Option with description" description="This is a description">
          Option with description
        </SelectOption>
        <SelectOption value="Disabled option" isDisabled>
          Disabled option
        </SelectOption>
        <SelectOption value="See Menu for additional variations!">See Menu for additional variations!</SelectOption>
        </SelectList>
        </Select>
        </PageSection>
        <PageSection>
          <Alert>
            
          </Alert>
        </PageSection>
    </Layout>
  )
};
export default Status;