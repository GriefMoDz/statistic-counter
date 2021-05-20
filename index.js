/* eslint-disable object-property-newline */
const { Plugin } = require('powercord/entities');
const { React, getModule, contextMenu } = require('powercord/webpack');
const { forceUpdateElement } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

const OnlineCount = require('./components/OnlineCount');
const ExtendedCount = require('./components/ExtendedCount');
const ContextMenu = require('./components/ContextMenu');

const counterStore = require('./counterStore');

module.exports = class OnlineFriendsCount extends Plugin {
  constructor () {
    super();

    this.state = { autoRotation: null, autoRotationPaused: false };
    this.classes = {
      ...getModule([ 'guildSeparator', 'listItem' ], false),
      tutorialContainer: (getModule([ 'homeIcon', 'downloadProgress' ], false)).tutorialContainer
    };
  }

  get counter () {
    let counter = counterStore.store.getActiveCounter();
    switch (counter) {
      case 'ONLINE_COUNT': counter = OnlineCount; break;
      case 'EXTENDED_COUNT': counter = ExtendedCount;
    }
    return counter;
  }

  async startPlugin () {
    this.loadStylesheet('./style.css');

    const HomeButtonsModule = await getModule([ 'DefaultHomeButton' ]);
    inject('onlineFriendsCount-counter', HomeButtonsModule, 'DefaultHomeButton', (_, res) => {
      if (!Array.isArray(res)) {
        res = [ res ];
      }

      res.push(React.createElement('div', {
        className: this.classes.listItem,
        onContextMenu: this.handleContextMenu.bind(this),
        onMouseEnter: () => this.setAutoRotationPaused(true),
        onMouseLeave: () => this.setAutoRotationPaused(false)
      }, React.createElement(this.counter, {
        clickable: counterStore.store.getFilteredExtendedCounters().length > 0,
        forceUpdateHomeButton: this.forceUpdateHomeButton.bind(this),
        invokeAutoRotation: this.handleAutoRotation.bind(this)
      })));

      return res;
    });

    this.forceUpdateHomeButton();
  }

  pluginWillUnload () {
    uninject('onlineFriendsCount-counter');
    this.forceUpdateHomeButton();
  }

  forceUpdateHomeButton () {
    forceUpdateElement(`.${this.classes.tutorialContainer}`);
  }

  setAutoRotationPaused (state) {
    this.state.autoRotationPaused = state;
    return this.forceUpdateHomeButton();
  }

  handleContextMenu (e) {
    contextMenu.openContextMenu(e, () => React.createElement(ContextMenu, { main: this }));
  }

  handleAutoRotation (rotateCounter) {
    const extendedCounts = counterStore.store.getFilteredExtendedCounters().length;

    clearInterval(this.state.autoRotation);

    if (this.settings.get('autoRotation', false) && extendedCounts > 0 && !this.state.autoRotationPaused) {
      this.state.autoRotation = setInterval(() => {
        rotateCounter();
      }, this.settings.get('autoRotationDelay', 3e4));
    } else {
      this.state.autoRotation = null;
    }
  }
};
