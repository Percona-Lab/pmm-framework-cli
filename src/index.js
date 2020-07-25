#!/usr/bin/env node

const program = require('commander'); // TODO: Make script more CLI friendly, provide description etc. using CommanderJS
const { Input, Select, MultiSelect, NumberPrompt } = require('enquirer');
const { questions } = require('./questions');
const shell = require('shelljs');

// CommanderJS configuration for CLI flags and help menu
program
  .version('1.0.0')
  .description('A CLI tool to use pmm-framework and setup pmm-server, pmm-client with DBs instances locally or inside dedicated Vagrant boxes.')
  .parse(process.argv);

let parameter_string = "./pmm-framework.sh --pmm2"; // Flags and parameters to be provided when pmm-framework.sh is executed


// Main function
async function getConfig(){
  let operation_choice = await new Select(questions.q_operation_choice).run();

  if(operation_choice == "Install pmm-server"){
    await install_server();
  }else if(operation_choice == "Install pmm-client"){
    await install_client();
  }else{
    console.log("Yet to be implemented. Terminating...\n");
  }

};


async function install_server(){
  parameter_string += " --setup"

  console.log("\nProvide server information...\n");
  let pmm_version = await new Select(questions.q_pmm_version).run();
  if(pmm_version == "Custom"){
    pmm_version = await new Input(questions.q_pmm_custom_version).run();
  }else if(pmm_version == "dev-latest"){
    parameter_string += " --dev --pmm-server-version " + pmm_version;
  }else{
    parameter_string += " --pmm-server-version " + pmm_version;
  }

  // Ask if setup needs to be done on new Vagrant box
  let setup_vagrant = await new Select(questions.q_setup_vagrant).run();
  if(setup_vagrant == "Yes"){
    await vagrant_up_server();
  }else{
    console.log('Executing pmm-framework on current machine...');
    shell.mkdir('-p', './pmm-framework');
    shell.cd('./pmm-framework');
    shell.exec(`${parameter_string}`);
  }

  console.log(parameter_string);
  // TODO: Add further setup for Vagrant box and pmm-server installation script
}


async function install_client(){
  console.log("Provide pmm-client information\n...");

  // Ask pmm-client version
  let pmm_version = await new Select(questions.q_pmm_version).run();
  if(pmm_version == "Custom"){
    pmm_version = await new Input(questions.q_pmm_custom_version).run();
  }
  parameter_string += " --pmm-server-version " + pmm_version; // Note: --pmm-client-version is not a defined flag in pmm-framework
  
  // Ask for dev repo installation
  if(await new Select(questions.q_dev_repo).run() == "Yes"){
    parameter_string += " --dev"
  }

  // Ask for DBs to be installed
  let db_list = await new MultiSelect(questions.q_select_db).run();
  console.log("DBs selected are: ", db_list);

  //Ask DB Specific flags, DB instance count
  db_count = {};
  for(let db_index in db_list){
    console.log("\nProvide details for: ", db_list[db_index]);

    // Ask DB instance count
    db_count[db_list[db_index]] = await new NumberPrompt(questions.q_db_count).run();
    parameter_string += " --addclient=" + db_list[db_index] + "," + db_count[db_list[db_index]].toString();

    // TODO: DB Specific flags (eg. sharding, query source)
    if(db_list[db_index] == 'ps'){
      await ps_flags();
    }else if(db_list[db_index] == 'ms'){
      await ms_flags();
    }else if(db_list[db_index] == 'md'){
      await md_flags();
    }else if(db_list[db_index] == 'pxc'){
      await pxc_flags();
    }else if(db_list[db_index] == 'mo'){    // Percona Server for MongoDB
      await mo_flags();
    }else if(db_list[db_index] == 'modb'){  // Official MongoDB
      await modb_flags();
    }else if(db_list[db_index] == 'pgsql'){
      await pgsql_flags();
    }

  }

  // Ask if setup needs to be done on new Vagrant box
  let setup_vagrant = await new Select(questions.q_setup_vagrant).run();
  if(setup_vagrant == "Yes"){
    await vagrant_up_client();
  }

  console.log("Database instances count: ", db_count);
  console.log(parameter_string);
}

async function ps_flags(){

}

async function ms_flags(){

}

async function md_flags(){

}

async function pxc_flags(){

}

async function mo_flags(){

}

async function modb_flags(){

}

async function pgsql_flags(){

}

async function vagrant_up_client(){
  console.log("\nVagrant Box setup in progress...");
  let vagrant_os = await new Select(questions.q_vagrant_os).run();
  if(vagrant_os == "Ubuntu"){
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir('-p', './vagrantboxes/client');
    shell.cp('./vagrantfiles/ubuntu/Vagrantfile', './vagrantboxes/client');
    shell.cp('./vagrantfiles/ubuntu/provision.sh', './vagrantboxes/client');
    shell.cd('./vagrantboxes/client');
    shell.exec('echo >> provision.sh');
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    shell.exec('vagrant up');
  }else{
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir('-p', './vagrantboxes/client');
    shell.cp('./vagrantfiles/centos/Vagrantfile', './vagrantboxes/client');
    shell.cp('./vagrantfiles/centos/provision.sh', './vagrantboxes/client');
    shell.cd('./vagrantboxes/client');
    shell.exec('echo >> provision.sh');
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    shell.exec('vagrant up');
  }
}

async function vagrant_up_server(){
  console.log("\nVagrant Box setup in progress...");
  let vagrant_os = await new Select(questions.q_vagrant_os).run();
  if(vagrant_os == "Ubuntu"){
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir('-p', './vagrantboxes/server');
    shell.cp('./vagrantfiles/ubuntu/Vagrantfile', './vagrantboxes/server');
    shell.cp('./vagrantfiles/ubuntu/provision.sh', './vagrantboxes/server');
    shell.cd('./vagrantboxes/server');
    shell.exec('echo >> provision.sh');
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    shell.exec('vagrant up');
  }else{
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir('-p', './vagrantboxes/server');
    shell.cp('./vagrantfiles/centos/Vagrantfile', './vagrantboxes/server');
    shell.cp('./vagrantfiles/centos/provision.sh', './vagrantboxes/server');
    shell.cd('./vagrantboxes/server');
    shell.exec('echo >> provision.sh');
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    shell.exec('vagrant up');
  }
}

getConfig();