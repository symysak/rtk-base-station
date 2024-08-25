import React from 'react';
import {Slider, SliderOnChangeEvent} from '@patternfly/react-core';
import Layout from '../layout';
import { Alert, PageSection } from '@patternfly/react-core';
const Status = () => {
  const [valueDiscrete, setValueDiscrete] = React.useState(62.5);
  const [inputValueDiscrete, setInputValueDiscrete] = React.useState(5);
  const stepsDiscrete = [{
    value: 0,
    label: '0'
  }, {
    value: 12.5,
    label: '1',
    isLabelHidden: true
  }, {
    value: 25,
    label: '2'
  }, {
    value: 37.5,
    label: '3',
    isLabelHidden: true
  }, {
    value: 50,
    label: '4'
  }, {
    value: 62.5,
    label: '5',
    isLabelHidden: true
  }, {
    value: 75,
    label: '6'
  }, {
    value: 87.5,
    label: '7',
    isLabelHidden: true
  }, {
    value: 100,
    label: '8'
  }];
  const stepsPercent = [{
    value: 0,
    label: '0%'
  }, {
    value: 25,
    label: '25%',
    isLabelHidden: true
  }, {
    value: 50,
    label: '50%'
  }, {
    value: 75,
    label: '75%',
    isLabelHidden: true
  }, {
    value: 100,
    label: '100%'
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
  return (
    <Layout>
        <PageSection>
        <Slider value={valueDiscrete} isInputVisible inputValue={inputValueDiscrete} customSteps={stepsDiscrete} onChange={onChangeDiscrete} />
        </PageSection>
        </Layout>
    )
};

export default Status;