const listTargetInstances = require('./listTargetInstances');

function listInstancesToStop(currentOperatingTimezone) {
  const params = {
    Filters: [
      {
        Name: 'instance-state-name',
        Values: ['running'],
      },
      //TODO: This is for testing this is for testing 
      {
        Name: 'tag:cloud653',
        Values: ['cloud653'],
      },      
      //TODO: This is for testing this is for testing
    ],
  };

  return listTargetInstances({ params, currentOperatingTimezone });
}

module.exports = listInstancesToStop;
