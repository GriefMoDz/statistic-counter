/* eslint-disable object-property-newline */
const { Plugin } = require('powercord/entities');
const { forceUpdateElement } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

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
      case 'FRIEND_COUNT': counter = FriendCount; break;
      case 'EXTENDED_COUNT': counter = ExtendedCount;
    }
    return counter;
  }

  async startPlugin () {
    this.loadStylesheet('./style.css');

    const { DefaultHomeButton } = await getModule([ 'DefaultHomeButton' ]);
    inject('onlineFriendsCount-counter', DefaultHomeButton.prototype, 'render', (_, res) => {
      // this.debug('onlineFriendsCount-counter -> render', res);

      if (!Array.isArray(res)) {
        res = [ res ];
      }

      res.push(React.createElement('div', {
        className: this.classes.listItem,
        onContextMenu: this.handleContextMenu.bind(this),
        onMouseOver: () => this.setAutoRotationPaused(true),
        onMouseOut: () => this.setAutoRotationPaused(false)
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
