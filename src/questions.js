// Questions/Queries list object
const questions = {
  q_operation_choice : {
    name: 'pmm-server-client',
    message: 'Select operation: ',
    choices: ['Install pmm-server', 'Install pmm-client', 'Destroy all VagrantBoxes', 'Wipe all pmm configuration', 'Remove client at given IP', 'Remove server at given IP']
  },
  q_pmm_version : {
    name: 'pmm-version',
    message: 'Select PMM version to be installed: ',
    choices: ['2.9.0', '2.8.0', 'dev-latest', 'Custom']
  },
  q_pmm_custom_version : {
    message: 'Enter PMM version you want to install: ',
    initial: '2.x.x'
  },
  q_dev_repo : {
    name: 'dev-repo or not',
    message: 'Do you want to install from development repository? ',
    choices: ['Yes', 'No']
  },
  q_select_db : {
    name: 'value',
    message: 'Select DBs to install on client (Select using Space bar): ',
    choices: [
      { name: 'Percona Server (ps)', value: 'ps' },
      { name: 'MySQL (ms)', value: 'ms' },
      { name: 'MariaDB (md)', value: 'md' },
      { name: 'Percona XtraDB Cluster (pxc)', value: 'pxc' },
      { name: 'MongoDB (mo)   - Percona Server for MongoDB', value: 'mo' },
      { name: 'MongoDB (modb) - Official MongoDB', value: 'modb' },
      { name: 'PostgreSQL (pgsql)', value: 'pgsql' }
    ],
    result(names) {   // This function returns just the short forms of DBs selected
      let resultObject = this.map(names);
      let result = [];
      for(let key in resultObject){
        result.push(resultObject[key]);
      }
      return result;
    }
  },
  q_db_count: {
    name: 'number',
    message: 'Please tell number of instances: '
  },
  q_setup_vagrant : {
    name: 'Install Vagrant or not',
    message: 'Do you want to setup new Vagrant Box for configuration? ',
    choices: ['Yes', 'No']
  },
  q_vagrant_os : {
    name: 'Vagrant OS',
    message: 'Select OS for the Vagrant Box: ',
    choices: ['Ubuntu', 'CentOS']
  },
  q_ssl : {
    name : 'Generate SSL certificate',
    message: 'Would you like to enable SSL encryption to protect PMM from unauthorized access?',
    choices: ['Yes', 'No']
  }
};

module.exports = { questions };