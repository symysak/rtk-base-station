import React from 'react';
import Layout from '../layout';
import { PageSection } from '@patternfly/react-core';
import { Select, SelectOption, SelectList, MenuToggle, MenuToggleElement, Checkbox } from '@patternfly/react-core';
const Status = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(
        /**
          @type {"Satelite1" | "Satelite2" | "Satelite3" | "undefined"}
         */
        ('undefined'));
    const [isDisabled, setIsDisabled] = React.useState(false);
    const onToggleClick = () => {
        setIsOpen(!isOpen);
    };
    const onSelect = (_event, value) => {
        console.log('selected', value);
        setSelected(value);
        setIsOpen(false);
    };
    const toggle = toggleRef => <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isDisabled={isDisabled} style={{
        width: '200px'
    }}>
        {selected}
        </MenuToggle>;
    return(
        <Layout>
            <PageSection>
            <Select id="single-select" isOpen={isOpen} selected={selected} onSelect={onSelect} onOpenChange={isOpen => setIsOpen(isOpen)} toggle={toggle} shouldFocusToggleOnSelect>
            <SelectList>
            <SelectOption value="Satelite1">Satelite1</SelectOption>
            <SelectOption value="Satelite2">Satelite2</SelectOption>
            <SelectOption value="Satelite3">Satelite3</SelectOption>
            </SelectList>
            </Select>
            </PageSection>
        </Layout>
    )
}

export default Status;