const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Counter = require('./components/Counter');
const ErrorBoundary = require('./components/ErrorBoundary');

module.exports = class StatisticsCounter extends Plugin {
  async startPlugin () {
    this.loadStylesheet('./style.css');
    this.patchHomeButton();
  }

  async patchHomeButton () {
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
          <Counter/>
        </ErrorBoundary>
      );

      return res;
    });
  }

  pluginWillUnload () {
    uninject('statistics-counter');
  }
};
