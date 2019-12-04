const { getModule } = require('powercord/webpack');
const constants = require('./constants');

module.exports = (plugin) => ({
  get guildCount () {
    return Object.keys(constants.GuildStore.getGuilds()).length;
  },

  get relationshipTypes () {
    const relationTypes = {};

    for (const type in constants.Discord.RelationshipTypes) {
      relationTypes[constants.Discord.RelationshipTypes[type]] = type;
    }

    return relationTypes;
  },

  get relationshipCounts () {
    const relationCounts = {};

    for (const type in this.relationshipTypes) {
      relationCounts[this.relationshipTypes[type]] = 0;
    }

    for (const id in constants.RelationshipStore.getRelationships()) {
      relationCounts[this.relationshipTypes[constants.RelationshipStore.getRelationships()[id]]]++;
    }

    return relationCounts;
  },

  get toggleStates () {
    const keys = plugin.settings.getKeys();
    const disabled = [];
    const enabled = [];

    for (const key of keys) {
      const setting = plugin.settings.get(key);

      if (typeof setting === 'boolean') {
        if (setting === true) {
          enabled.push(key);
        } else {
          disabled.push(key);
        }
      }
    }

    return { enabled,
      disabled };
  },

  skipFilteredCounters () {
    const { disabled } = this.toggleStates;

    plugin.state.type++;

    if (disabled.length > 0) {
      const disabledIndexes = Object.values(disabled).map(d => Object.keys(constants.Types).findIndex(type => type.toLowerCase() === d));

      while (disabledIndexes.includes(plugin.state.type)) {
        plugin.state.type++;
      }
    }
  },

  async import (id, filter) {
    if (typeof filter === 'string') {
      filter = [ filter ];
    }

    constants[id] = (await getModule(filter));
  }
});
