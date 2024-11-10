import React from 'react';
import {Alert, AlertProps, AlertGroup, AlertActionCloseButton, AlertVariant, InputGroup, InputGroupItem,Select, Slider, SliderOnChangeEvent} from '@patternfly/react-core';
import Layout from '../layout';
import buttonStyles from '@patternfly/react-styles/css/components/Button/button';
import { Button, PageSection } from '@patternfly/react-core';
const Status = () => {


  const [alerts, setAlerts] = React.useState([]);
  const maxDisplayed = 1;
  const addAlert = (title, variant, key) => {
    removeAlert(1);
    setAlerts(prevAlerts => [...prevAlerts, {
      title,
      variant,
      key
    }]);
  };
  const removeAlert = key => {
    const newAlerts = alerts.filter(alert => alert.key !== key);
    setAlerts(newAlerts);
  };
  const addDangerAlert_Min = () => {
    addAlert('Danger alert : Over Min Value', 'danger', 1);
  };
  const addDangerAlert_Max = () => {
    addAlert('Danger alert : Over Max Value', 'danger', 1);
  };
  const onOverflowClick = () => {
    console.log('Overflow message clicked');
  };


  const [valueDiscrete, setValueDiscrete] = React.useState(62.5);
  const [inputValueDiscrete, setInputValueDiscrete] = React.useState(5);
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
        addDangerAlert_Max();
      } else {
        const minValue = Number(stepsDiscrete[0].label);
        if (inputValue < minValue) {
          newValue = Number(stepsDiscrete[0].value);
          newInputValue = minValue;
          setLocalInputValue(minValue);
          addDangerAlert_Min();
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
      <AlertGroup isLiveRegion  >
        {alerts.slice(0, maxDisplayed).map(({key, variant, title}) => <Alert isInline variant={AlertVariant[variant]} title={title} actionClose={<AlertActionCloseButton title={title} variantLabel={`${variant} alert`} onClose={() => removeAlert(key)} />} key={key} />)}
      </AlertGroup>
        <Slider value={valueDiscrete} isInputVisible inputValue={inputValueDiscrete} customSteps={stepsDiscrete} onChange={onChangeDiscrete} />
        </PageSection>
        </Layout>
    )
};

export default Status;