var models = require('express-cassandra')

models.setDirectory(__dirname + '/models').bind(
  {
    clientOptions: {
      contactPoints: ['172.17.24.189'],
      protocolOptions: { port: 9042 },
      keyspace: 'discussions',
      queryOptions: {consistency: models.consistencies.one}
    },
    ormOptions: {
      defaultReplicationStrategy: {
        class: 'SimpleStrategy',
        replication_factor: 1
      },
      migration: 'safe'
    }
  },
  function (err) {
    if (err) throw err
  }
)

module.exports = models
