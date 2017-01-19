/*
 * slush-reloader
 * https://github.com/arvindr21/slush-reloader
 *
 * Copyright (c) 2014, Arvind Ravulavaru
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
  install = require('gulp-install'),
  conflict = require('gulp-conflict'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  color = require('gulp-color'),
  cPng = require('console-png'),
  inquirer = require('inquirer');

cPng.attachTo(console);

var globals = {
  wrkdir: process.cwd(),
  appPaths: {
    site: {
      moduleName: 'site.module.ts',
      lessPrefix: 'prefix',
      modulePath: 'modules/site/'
    },
    amplify: {
      moduleName: 'amplify.module.ts',
      lessPrefix: 'core-prefix',
      modulePath: 'modules/amplify/'
    },
    funnel: {
      moduleName: 'funnel.module.ts',
      lessPrefix: 'prefix',
      modulePath: 'modules/funnel/'
    },
    checkout: {
      moduleName: 'funnel.module.ts',
      lessPrefix: 'prefix',
      modulePath: 'modules/funnel/'
    }
  },
  sep: '/',
  prePath: process.cwd().substr(0, process.cwd().indexOf('modules')),
  compToken: '\/*comptoken*\/',
  importCompToken: '\/*importcomptoken*\/',
  srvToken: '\/*srvtoken*\/',
  importSrvToken: '\/*importsrvtoken*\/',
  dircToken: '\/*dirctoken*\/',
  importDircToken: '\/*importdirctoken*\/'
};

function format(string) {
  return string.toLowerCase().replace(/\s/g, '');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function getMainModuleSrc(type) {
  return gulp.src(globals.prePath + globals.curAppPaths.modulePath + type);
}

function camelCase(str) {
  return str
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function ($1) {
      return $1.toLowerCase();
    });
}

function setFileName(compName, file) {
  if (file.basename[0] === '_') {
    file.basename = '.' + file.basename.slice(1);
  }
  var newName = file.basename.split('.');
  newName[0] = compName;
  file.basename = newName.join('.');
}

function createComponent(answers) {
  answers.compName = camelCase(answers.compName);
  answers.compNameHyph = camelCaseToDash(answers.compName);
  answers.compNameU = capitalizeFirstLetter(answers.compName);
  answers.compNameL = answers.compName;
  answers.compNameComp = answers.compNameU + 'Component';
  answers.path = globals.wrkdir.substr(globals.wrkdir.indexOf('modules'), globals.wrkdir.length - 1);
  globals.curAppPaths = globals.appPaths[answers.appName.toLowerCase()];
  answers.lessPrefix = globals.curAppPaths.lessPrefix;
  var path = [];
  for (var i = 0; i < answers.path.split(globals.sep).length - 1; i++) {
    path.push('..');
  }
  answers.prefix = path.join(globals.sep);

  getMainModuleSrc(globals.curAppPaths.moduleName)
    .pipe(replace(globals.compToken, '.component(' + answers.compNameComp + '.obName, ' + answers.compNameComp + ')\n' + globals.compToken))
    .pipe(replace(globals.importCompToken, "import " + answers.compNameComp + " from '../../" + answers.path + globals.sep + answers.compNameHyph + globals.sep + answers.compNameHyph + ".component'\n  " + globals.importCompToken))
    .pipe(gulp.dest(globals.prePath + globals.curAppPaths.modulePath));

}

gulp.task('default', function (done) {
  var prompts = [{
    name: 'compName',
    message: 'What is the name of your component??(Please use camel case names, i.e newComp)'
  },
    {
      type: 'list',
      name: 'appName',
      message: 'What App is this for?',
      choices: ["Site", "Amplify", "Funnel", "Checkout"]
    }];
  inquirer.prompt(prompts, function (answers) {
    createComponent(answers);
    gulp.src(__dirname + '/templates/component/*.*')
      .pipe(template(answers))
      .pipe(rename(setFileName.bind(setFileName, answers.compNameHyph)))
      .pipe(conflict('./' + answers.compNameHyph))
      .pipe(gulp.dest('./' + answers.compNameHyph))
      .on('end', function () {
        console.png(new Buffer('iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAP1BMVEX///8vo/wvmOkNNlYkjd0WgdSAWw4AAAD/rgDQEBDAjB23Ly80O5t7CQmQFRVABgYUXpb903rn5OQSF1kScboREC/0AAABzklEQVRIia3ViXKEIAwAUJMQ8KiuPf7/W5sEULxY7TTdnY4Lz4RLm+Y/w3tfbSeih4YAYG+8bytEhZmC+ba9Q6hIJb/xsdjSMAPRWh1ZqWcjLAmjdlquY+JKHjWIRZKmAZAvNZeIUGNpJvgSot/rPP6z7ft1gmj+CkKC1HebSPe5Tny7Iwyzjf9ynmUk0lwMRa6F4HFLFARKIsOQLDMg49XKRAHabiEEWUOy2IJeE7aZRuAAKQIu9zoljPG/rGoIpgLbGLdrVhDNkW8eTAXbRJAUHQhbS9xaIY1lyXswlFtQR6zJQqoGsUS0IVazc4xl6E+LORJU4WIlK5qdy5l2pZEi54ji8URYnJiEsDgbCdnUExRhPWeOyO5zthM2pNgSabLvEKufeJm4s61zKSpp1oWIE0CeIYvzXU24Czl8+RYXZ4dk8dzS3zk9rnWhRITLfyravirEOFsHF0OeIkL6N89A68qZKJDnSO3hnEwm5BTUX03bNKwX78A2jZDauPd5cpb6WyYTzrVFcicP6bF39qH6kuyMxc/Zi7duxrH69jsx0zS9bvWPZhiGbhjGB+bVCRgm+dw2QqSs7glR03V/IKPEx/cDId01bpMxgT35BTY9ECFAFZPUAAAAAElFTkSuQmCC', 'base64'));
        done();
        console.log(color('Your wish is my command!', 'GREEN'));
      });
  })
});

function createService(answers) {
  answers.srvName = camelCase(answers.srvName);
  answers.srvNameU = capitalizeFirstLetter(answers.srvName);
  answers.srvNameService = capitalizeFirstLetter(answers.srvName);
  answers.srvNameHyph = camelCaseToDash(answers.srvName);
  answers.path = globals.wrkdir.substr(globals.wrkdir.indexOf('modules'), globals.wrkdir.length - 1);

  getMainModuleSrc(globals.curAppPaths.moduleName)
    .pipe(replace(globals.srvToken, '.service(' + answers.srvNameService + '.obName, ' + answers.srvNameService + ')\n' + globals.srvToken))
    .pipe(replace(globals.importSrvToken, "import " + answers.srvNameHyph + " from '../../" + answers.path + globals.sep + answers.srvNameHyph + ".srv'\n" + globals.importSrvToken))
    .pipe(gulp.dest(globals.prePath + globals.curAppPaths.modulePath));

}

gulp.task('service', function (done) {
  var prompts = [{
    name: 'srvName',
    message: 'What is the name of your service?'
  }];
  inquirer.prompt(prompts, function (answers) {
    createService(answers);
    gulp.src(__dirname + '/templates/service/*.*')
      .pipe(template(answers))
      .pipe(rename(setFileName.bind(setFileName, answers.srvName)))
      .pipe(conflict('./'))
      .pipe(gulp.dest('./'))
      .on('end', function () {
        console.png(new Buffer('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', 'base64').toString('binary'));
        //console.log(color('Your wish is my command!', 'GREEN'));
        done();
      });
  })
});