#!/usr/bin/env node

const program = require('commander'); // TODO: Make script more CLI friendly, provide description etc. using CommanderJS
const { Input, Select, MultiSelect, NumberPrompt } = require('enquirer');
const { questions } = require('./questions');
const shell = require('shelljs');
const fs = require("fs")
const path = require("path")
const child_process = require('child_process');  // Another Shell API for commands that require user input

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
  }else if(operation_choice == "List VagrantBoxes (directories)"){
    console.log(getVagrantDirs(__dirname + "/vagrantboxes"));
  }else if(operation_choice == "Destroy VagrantBox(s)"){
    await destroy_vbox();
  }else if(operation_choice == "Get IP of a VagrantBox"){
    await get_ip_vbox();
  }else if(operation_choice == "Execute a command on selected Vagrantbox"){
    await exec_in_vbox();
  }else if(operation_choice == "Execute PMM Framework on current machine"){
    await exec_framework();
  }else{
    console.log("Yet to be implemented. Terminating...\n");
  }

};


async function install_server(){
  parameter_string += " --setup-server";

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
  parameter_string += " --setup-client";

  console.log("Provide pmm-client information\n...");

  // Ask pmm-client version
  let pmm_version = await new Select(questions.q_pmm_version).run();
  if(pmm_version == "Custom"){
    pmm_version = await new Input(questions.q_pmm_custom_version).run();
  }
  parameter_string += " --pmm-server-version " + pmm_version; // Note: --pmm-client-version is not a defined flag in pmm-framework
  
  // Ask for PMM-Server IP
  pmm_server_ip = await new Input(questions.q_server_ip).run();
  parameter_string += " --pmm2-server-ip " + pmm_server_ip;

  // Ask for DBs to be installed
  let db_list = await new MultiSelect(questions.q_select_db).run();
  console.log("DBs selected are: ", db_list);

  // Ask for get_download_link.sh
  if(db_list.length > 0){
    let use_get_download_sh = await new Select(questions.q_get_download_link).run();
    if(use_get_download_sh == "Yes"){
      parameter_string += " --download"
    }
  }

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

async function ps_flags(){}

async function ms_flags(){}

async function md_flags(){}

async function pxc_flags(){}

async function mo_flags(){}

async function modb_flags(){}

async function pgsql_flags(){}

async function vagrant_up_client(){
  console.log("\nVagrant Box setup in progress...");
  let vagrant_os = await new Select(questions.q_vagrant_os).run();
  if(vagrant_os == "Ubuntu"){
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir(`-p`, `${__dirname}/vagrantboxes/client`);
    shell.cp(`${__dirname}/vagrantfiles/client/ubuntu/Vagrantfile`, `${__dirname}/vagrantboxes/client`);
    shell.cp(`${__dirname}/vagrantfiles/client/ubuntu/provision.sh`, `${__dirname}/vagrantboxes/client`);
    shell.cd(`${__dirname}/vagrantboxes/client`);
    shell.exec(`echo >> provision.sh`);
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    child_process.execSync('vagrant up', {stdio: 'inherit'});
  }else{
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir(`-p`, `${__dirname}/vagrantboxes/client`);
    shell.cp(`${__dirname}/vagrantfiles/centos/Vagrantfile`, `${__dirname}/vagrantboxes/client`);
    shell.cp(`${__dirname}/vagrantfiles/centos/provision.sh`, `${__dirname}/vagrantboxes/client`);
    shell.cd(`./vagrantboxes/client`);
    shell.exec(`echo >> provision.sh`);
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    child_process.execSync('vagrant up', {stdio: 'inherit'});
  }
}

async function vagrant_up_server(){
  console.log("\nVagrant Box setup in progress...");
  let vagrant_os = await new Select(questions.q_vagrant_os).run();
  if(vagrant_os == "Ubuntu"){
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir(`-p`, `${__dirname}/vagrantboxes/server`);
    shell.cp(`${__dirname}/vagrantfiles/server/ubuntu/Vagrantfile`, `${__dirname}/vagrantboxes/server`);
    shell.cp(`${__dirname}/vagrantfiles/server/ubuntu/provision.sh`, `${__dirname}/vagrantboxes/server`);
    shell.cd(`${__dirname}/vagrantboxes/server`);
    shell.exec(`echo >> provision.sh`);
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    child_process.execSync('vagrant up', {stdio: 'inherit'});
  }else{
    console.log("****** Initializing Vagrant Box ******");
    shell.mkdir(`-p`, `${__dirname}/vagrantboxes/server`);
    shell.cp(`${__dirname}/vagrantfiles/centos/Vagrantfile`, `${__dirname}/vagrantboxes/server`);
    shell.cp(`${__dirname}/vagrantfiles/centos/provision.sh`, `${__dirname}/vagrantboxes/server`);
    shell.cd(`${__dirname}/vagrantboxes/server`);
    shell.exec(`echo >> provision.sh`);
    shell.exec(`echo ${parameter_string} >> provision.sh`);
    child_process.execSync('vagrant up', {stdio: 'inherit'});
  }
}

async function destroy_vbox(){
  let vagrantDirs = getVagrantDirs(__dirname + "/vagrantboxes"); // Get directories of vagrant boxes
  if(vagrantDirs.length > 0){
    questions.q_select_vbox.choices = vagrantDirs; // Look for currently installed Vagrant Boxes
    let remove_vagrant = await new MultiSelect(questions.q_select_vbox).run();

    for(let dir in remove_vagrant){
      console.log(`Destroying ${remove_vagrant[dir]}...`);
      try{
        shell.exec(`cd ${remove_vagrant[dir]} ; vagrant destroy -f`);
        shell.rm('-rf', `${remove_vagrant[dir]}`);
      }catch(e){
        console.log("Error: " + e);
      }
    }
  }else{
    console.log("No VagrantBoxes found.");
  }
}

function getVagrantDirs(dirPath, arrayOfFiles) {
  try{
    files = fs.readdirSync(dirPath)
  }catch(e){
    console.log("No VagrantBoxes found.");
    return [];
  }
  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getVagrantDirs(dirPath + "/" + file, arrayOfFiles);
    } else if(file == "Vagrantfile") {
      arrayOfFiles.push(dirPath);
    }
  })

  return arrayOfFiles;
}

async function get_ip_vbox(){
  let vagrantDirs = getVagrantDirs(__dirname + "/vagrantboxes"); // Get directories of vagrant boxes
  if(vagrantDirs.length > 0){
    questions.q_get_ip.choices = vagrantDirs; // Look for currently installed Vagrant Boxes
    let selected_box = await new Select(questions.q_get_ip).run();
    console.log("\nIP of the selected box is: ");
    shell.exec(`cd ${selected_box} ; vagrant ssh -c "hostname -I" `); // Get IP from selected box
  }else{
    console.log("No VagrantBoxes found.");
  }

}

async function exec_in_vbox(){
  let vagrantDirs = getVagrantDirs(__dirname + "/vagrantboxes"); // Get directories of vagrant boxes
  if(vagrantDirs.length > 0){
    questions.q_exec_in_vbox.choices = vagrantDirs; // Look for currently installed Vagrant Boxes
    let selected_box = await new Select(questions.q_exec_in_vbox).run();
    let exec_command = await new Input(questions.q_exec_command).run();
    console.log("\nExecuting...\n");
    shell.exec(`cd ${selected_box} ; vagrant ssh -c "${exec_command}" `); // Get IP from selected box
  }else{
    console.log("No VagrantBoxes found.");
  }
}

async function exec_framework(){
  console.log("Enter only the flags/options to pass to pmm-framework.");
  questions.q_exec_command.initial = '--pmm2 ';
  let exec_command = await new Input(questions.q_exec_command).run();
  shell.mkdir('-p', `${__dirname}/pmm-framework`);
  shell.cd(`${__dirname}/pmm-framework`);
  shell.exec(`wget https://raw.githubusercontent.com/percona/pmm-qa/GSOC-2020/pmm-tests/pmm-framework.sh ; chmod +x pmm-framework.sh`);
  shell.exec(`./pmm-framework.sh ${exec_command}`);
}

getConfig();