import React from 'react';
import Layout from '../layout';
import { Alert, PageSection } from '@patternfly/react-core';
import { Select, SelectOption, SelectList, MenuToggle ,Slider} from '@patternfly/react-core';
/*
import解説
ドロップダウン用:Select,SelectOption,SelectList,MenuToggle
スライダー用:Slider
*/

const Status = () => {

  //ここからドロップダウン用State
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
    //ここまでドロップダウン用State

    //ここからスライダー用State
    const [valueDiscrete,setValueDiscrete] = React.useState(100);
    const [inputValueDiscrete, setInputValueDiscrete] = React.useState(10);
    const stepsDiscrete = [{
        value: 0,
        label: '0'
      }, {
        value: 10,
        label: '1',
      }, {
        value: 20,
        label: '2'
      }, {
        value: 30,
        label: '3',
      }, {
        value: 40,
        label: '4'
      },{
        value: 50,
        label: '5'
      }, {
        value: 60,
        label: '6',
      }, {
        value: 70,
        label: '7'
      }, {
        value: 80,
        label: '8',
      }, {
        value: 90,
        label: '9'
      },{
        value: 100,
        label: '10'
      }];
      const onChangeDiscrete = (_event, value, inputValue, setLocalInputValue) => {
        let newValue;
        let newInputValue;
        if (inputValue === undefined) {
          const step = stepsDiscrete.find(step => step.value === value);
          newInputValue = step ? step.label : 0;
          newInputValue = Number(newInputValue);
          newValue = value;
        } else {
          const maxValue = Number(stepsDiscrete[stepsDiscrete.length - 1].label);
          if (inputValue > maxValue) {
            newValue = Number(stepsDiscrete[stepsDiscrete.length - 1].value);
            newInputValue = maxValue;
            setLocalInputValue(maxValue);
          } else {
            const minValue = Number(stepsDiscrete[0].label);
            if (inputValue < minValue) {
              newValue = Number(stepsDiscrete[0].value);
              newInputValue = minValue;
              setLocalInputValue(minValue);
            } else {
              const stepIndex = stepsDiscrete.findIndex(step => Number(step.label) >= inputValue);
              if (Number(stepsDiscrete[stepIndex].label) === inputValue) {
                newValue = stepsDiscrete[stepIndex].value;
                newInputValue = inputValue;
              } else {
                const midpoint = (Number(stepsDiscrete[stepIndex].label) + Number(stepsDiscrete[stepIndex - 1].label)) / 2;
                if (midpoint > inputValue) {
                  newValue = stepsDiscrete[stepIndex - 1].value;
                  newInputValue = Number(stepsDiscrete[stepIndex - 1].label);
                } else {
                  newValue = stepsDiscrete[stepIndex].value;
                  newInputValue = Number(stepsDiscrete[stepIndex].label);
                }
              }
            }
          }
        }
        setInputValueDiscrete(newInputValue);
        setValueDiscrete(newValue);
      };
      //ここまでスライダー用State
    return(
        <Layout>
          <PageSection>
            <Alert title="DropDown">
            <Select id="single-select" isOpen={isOpen} selected={selected} onSelect={onSelect} onOpenChange={isOpen => setIsOpen(isOpen)} toggle={toggle} shouldFocusToggleOnSelect>
            <SelectList>
            <SelectOption value="Satelite1">Satelite1</SelectOption>
            <SelectOption value="Satelite2">Satelite2</SelectOption>
            <SelectOption value="Satelite3">Satelite3</SelectOption>
            </SelectList>
            </Select>
            </Alert>
            <Alert title="DropDown1">
            <Select id="single-select" isOpen={isOpen} selected={selected} onSelect={onSelect} onOpenChange={isOpen => setIsOpen(isOpen)} toggle={toggle} shouldFocusToggleOnSelect>
            <SelectList>
            <SelectOption value="Satelite1">Satelite1</SelectOption>
            <SelectOption value="Satelite2">Satelite2</SelectOption>
            <SelectOption value="Satelite3">Satelite3</SelectOption>
            </SelectList>
            </Select>
            </Alert>
          </PageSection>
          <br />
          
          <PageSection>
            <Alert title="Slider">
            <Slider value={valueDiscrete} isInputVisible inputValue={inputValueDiscrete} customSteps={stepsDiscrete} onChange={onChangeDiscrete} />
            <Slider value={valueDiscrete} isInputVisible inputValue={inputValueDiscrete} customSteps={stepsDiscrete} onChange={onChangeDiscrete} />
            </Alert>
          </PageSection>
        </Layout>
    )
}

export default Status;