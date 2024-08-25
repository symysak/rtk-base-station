import React from 'react';
import { Alert, PageSection } from '@patternfly/react-core';
import {Select, SelectOption, SelectList, MenuToggle, MenuToggleElement} from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import Layout from '../layout';
const Status = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('Select a value');
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const onSelect = (_event, value) => {
    console.log('selected', value);
    setSelected(value);
    setIsOpen(false);
  };
  const toggle = toggleRef => <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} style={{
    width: '200px'
  }}>
      {selected}
    </MenuToggle>;
  return (
    <Layout>
        <PageSection>
        <Select id="option-variations-select" isOpen={isOpen} selected={selected} onSelect={onSelect} onOpenChange={isOpen => setIsOpen(isOpen)} toggle={toggle} shouldFocusToggleOnSelect>
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
    </Layout>
  )
};
export default Status;