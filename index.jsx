const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, Flux, getModule } = require('powercord/webpack');

const Constants = require('./lib/Constants');
const CounterStore = Flux.Store?.getAll?.().find(store => store.constructor.name === 'CounterStore') || require('./lib/Store');

const Counter = require('./components/Counter');
const ErrorBoundary = require('./components/ErrorBoundary');

module.exports = class StatisticsCounter extends Plugin {
  constructor () {
    super();

    this.constants = Constants;
    this.counterStore = CounterStore;
  }

  async startPlugin () {
    this.loadStylesheet('./style.css');
    this.patchHomeButton();
  }

  async patchHomeButton () {
    const ConnectedCounter = Flux.connectStores([ powercord.api.settings.store ], () => ({
      ...powercord.api.settings._fluxProps('statistics-counter'),
      main: this
    }))(Counter);

    const HomeButtonModule = await getModule([ 'HomeButton' ]);
    if (!HomeButtonModule) {
      return this.error('Missing “HomeButton” module; skipping injection');
    }

    inject('statistics-counter', HomeButtonModule, 'HomeButton', (_, res) => {
      if (!Array.isArray(res)) {
        res = [ res ];
      }

      res.push(
        <ErrorBoundary>
          <ConnectedCounter/>
        </ErrorBoundary>
      );

      return res;
    });
  }

  pluginWillUnload () {
    uninject('statistics-counter');
  }
};
