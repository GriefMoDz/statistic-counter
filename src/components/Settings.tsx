import { common, components, util, webpack } from 'replugged';
import { ReactComponent } from 'replugged/dist/types';

import { ActionTypes, Counters } from '@lib/constants';
import { CounterType } from '@types';
import { prefs } from '../';

import CounterStore from '@lib/store';
import Counter from './Counter';

const { Divider, SwitchItem, Text } = components;

const SliderModule = await webpack.waitForModule<any>(webpack.filters.bySource('moveStaggered'));
const Slider = webpack.getFunctionBySource('moveStaggered', SliderModule) as ReactComponent<{}>;
const Messages = webpack.getByProps('Messages', 'getLanguages')?.Messages as Record<string, unknown>;

function CounterSettings(): React.ReactElement[] {
  // @ts-expect-error Yeah... whatever.
  return Object.keys(Counters).map((counter: CounterType) => {
    const counterName = Messages[Counters[counter].translationKey] as string;
    const useCounterEnabled = util.useSetting(prefs, counter);

    return (
      <SwitchItem
        {...useCounterEnabled}
        disabled={CounterStore.filteredCounters.length === 1 && CounterStore.filteredCounters.includes(counter)}
        onChange={(newValue) => {
          useCounterEnabled.onChange(newValue);

          if (newValue === false) {
            const { activeCounter, nextCounter } = CounterStore.state;

            activeCounter === counter &&
              common.fluxDispatcher.dispatch({
                type: ActionTypes.STATISTICS_COUNTER_SET_ACTIVE,
                counter: nextCounter
              });
          }
        }}>
        Show {counterName}
      </SwitchItem>
    );
  });
}

function Preview(): React.ReactElement {
  return (
    <div className='statistic-counter-preview'>
      <div className='home-button'>
        <svg className='home-icon' width={28} height={20} viewBox='0 0 28 20'>
          <path
            fill='currentColor'
            d='M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z'
          />
        </svg>
      </div>
      <Counter />
    </div>
  );
}

function Settings(): React.ReactElement {
  const useAutoRotation = util.useSetting(prefs, 'autoRotation');
  const useAutoRotationHoverPause = util.useSetting(prefs, 'autoRotationHoverPause');
  const useAutoRotationDelay = util.useSetting(prefs, 'autoRotationDelay');

  const handleRotationDelay = (delay: number) => {
    useAutoRotationDelay.onChange(Math.round(delay));
  };

  return (
    <div>
      <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>
        Preview
      </Text.Eyebrow>
      {Preview()}
      <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>
        Visibility
      </Text.Eyebrow>
      {CounterSettings()}
      <SwitchItem {...util.useSetting(prefs, 'preserveLastCounter')}>Preserve Last Counter</SwitchItem>
      <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>
        Auto Rotation
      </Text.Eyebrow>
      <SwitchItem {...useAutoRotation}>Enabled</SwitchItem>

      {useAutoRotation.value && (
        <>
          <Text.Eyebrow style={{ marginBottom: 15 }} color='header-secondary'>
            Rotate Interval
          </Text.Eyebrow>
          <Slider
            className='statistic-counter-settings-slider'
            value={useAutoRotationDelay.value}
            initialValue={useAutoRotationDelay.value}
            defaultValue={5e3}
            markers={[5e3, 9e5, 18e5, 27e5, 36e5]}
            minValue={5e3}
            maxValue={36e5}
            onMarkerRender={(value: number) => {
              const seconds = value / 1000;
              const minutes = value / 1000 / 60;
              return value < 6e4 ? `${seconds.toFixed(0)} secs` : `${minutes.toFixed(0)} min${Math.round(minutes) > 1 ? 's' : ''}`;
            }}
            onValueRender={(value: number) => {
              const seconds = value / 1000;
              const minutes = value / 1000 / 60;
              return value < 6e4 ? `${seconds.toFixed(0)} secs` : `${minutes.toFixed(0)} min${Math.round(minutes) > 1 ? 's' : ''}`;
            }}
            onValueChange={handleRotationDelay}
          />
          <Divider style={{ marginBottom: 15 }} />
          <SwitchItem {...useAutoRotationHoverPause}>Pause on Hover</SwitchItem>
        </>
      )}
    </div>
  );
}

export default Settings;
