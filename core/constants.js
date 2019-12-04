const { constants: { RelationshipTypes } } = require('powercord/webpack');

module.exports = {
  Stores: {
    GuildStore: 'getGuilds',
    StatusStore: 'getStatus',
    RelationshipStore: 'getRelationships'
  },
  Discord: {
    RelationshipTypes
  },
  Types: {
    Online: 0,
    Friends: 1,
    Pending: 2,
    Blocked: 3,
    Guilds: 4
  }
};
