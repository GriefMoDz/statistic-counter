const { Plugin } = require('powercord/entities');
const { React, Flux, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Constants = require('./lib/Constants');
const CounterStore = require('./lib/Store');

const Counter = require('./components/Counter');

module.exports = class StatisticsCounter extends Plugin {
  constructor () {
    super();

    this.constants = Constants;
    this.counterStore = CounterStore;
  }

  async startPlugin () {
    this.loadStylesheet('./style.css');

    const ConnectedCounter = Flux.connectStores([ powercord.api.settings.store ], () => ({
      ...powercord.api.settings._fluxProps(this.entityID),
      main: this
    }))(Counter);

    const HomeButtonModule = await getModule([ 'HomeButton' ]);
    inject('statistics-counter', HomeButtonModule, 'HomeButton', (_, res) => {
      if (!Array.isArray(res)) {
        res = [ res ];
      }

      res.push(
        <ConnectedCounter main={this} />
      );

      return res;
    });
  }

  pluginWillUnload () {
    uninject('statistics-counter');
  }
};
