import { components, util, webpack } from 'replugged';
import { ReactComponent } from 'replugged/dist/types';

import { Counters } from '@lib/constants';
import { CounterType } from '@types';
import { prefs } from '../';

import CounterStore from '@lib/store';
const { Divider, SwitchItem, Text } = components;

const SliderModule = await webpack.waitForModule<any>(webpack.filters.bySource('moveStaggered'));
const Slider = webpack.getFunctionBySource('moveStaggered', SliderModule) as ReactComponent<{}>;
const Messages = webpack.getByProps('Messages', 'getLanguages')?.Messages as Record<string, unknown>;

function CounterSettings(): React.ReactElement[] {
  // @ts-expect-error Yeah... whatever.
  return Object.keys(Counters).map((counter: CounterType) => {
    const counterName = Messages[Counters[counter].translationKey] as string;

    return <SwitchItem
      {...util.useSetting(prefs, counter)}
      disabled={CounterStore.filteredCounters.length === 1 && CounterStore.filteredCounters.includes(counter)}
    >
      Show {counterName}
    </SwitchItem>;
  });
}

function Settings(): React.ReactElement {
  const useAutoRotation = util.useSetting(prefs, 'autoRotation');
  const useAutoRotationHoverPause = util.useSetting(prefs, 'autoRotationHoverPause');
  const useAutoRotationDelay = util.useSetting(prefs, 'autoRotationDelay');

  return (
    <div>
      <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>Visibility</Text.Eyebrow>
      {CounterSettings()}
      <SwitchItem {...util.useSetting(prefs, 'preserveLastCounter')}>
        Preserve Last Counter
      </SwitchItem>
      <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>Auto Rotation</Text.Eyebrow>
      <SwitchItem {...useAutoRotation}>
        Enabled
      </SwitchItem>

      {useAutoRotation.value && <>
        <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>Rotate Interval</Text.Eyebrow>
        <Slider
          className='statistic-counter-settings-slider'
          value={useAutoRotationDelay.value}
          initialValue={useAutoRotationDelay.value}
          defaultValue={5e3}
          markers={[ 5e3, 9e5, 18e5, 27e5, 36e5 ]}
          minValue={5e3}
          maxValue={36e5}
          onMarkerRender={(value: number) => {
            const seconds = (value / 1000);
            const minutes = ((value / 1000) / 60);
            return value < 6e4 ? `${seconds.toFixed(0)} secs` : `${minutes.toFixed(0)} mins`;
          }}
          onValueRender={(value: number) => {
            const seconds = (value / 1000);
            const minutes = ((value / 1000) / 60);
            return value < 6e4 ? `${seconds.toFixed(0)} secs` : `${minutes.toFixed(0)} mins`;
          }}
          onValueChange={useAutoRotationDelay.onChange}
        />
        <Divider style={{ marginBottom: 15 }} />
        <SwitchItem {...useAutoRotationHoverPause}>
         Pause on Hover
        </SwitchItem>
      </>}
    </div>
  );
}

export default Settings;
