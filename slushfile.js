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
  inquirer = require('inquirer');


var globals = {
  wrkdir: process.cwd(),
  siteModule: 'site.module.ts',
  siteLess: 'site.less',
  sitemodulePath: 'modules/site/',
  sep: '/',
  prePath:  process.cwd().substr(0,  process.cwd().indexOf('modules')),
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
  return gulp.src(globals.prePath + globals.sitemodulePath + type);
}

function camelCase(str) {
  return str
    .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
    .replace(/\s/g, '')
    .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
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
  answers.compNameComp =  answers.compNameU + 'Component';
  answers.path = globals.wrkdir.substr(globals.wrkdir.indexOf('modules'), globals.wrkdir.length - 1);
  var path = [];
  for(var i = 0 ; i < answers.path.split(globals.sep).length - 1 ; i++) {
    path.push('..');
  }
  answers.prefix = path.join(globals.sep);

  getMainModuleSrc(globals.siteModule)
    .pipe(replace(globals.compToken, '.component(' + answers.compNameComp + '.obName, ' + answers.compNameComp + ')\n' + globals.compToken))
    .pipe(replace(globals.importCompToken, "import " + answers.compNameComp + " from '../../" + answers.path + globals.sep + answers.compNameHyph + globals.sep + answers.compNameHyph + ".component'\n  " + globals.importCompToken))
    .pipe(gulp.dest(globals.prePath + globals.sitemodulePath));

  getMainModuleSrc(globals.siteLess)
    .pipe(replace(globals.importCompToken, "@import '../../" + answers.path + globals.sep + answers.compNameHyph + globals.sep + answers.compNameHyph + "';\n" + globals.importCompToken))
    .pipe(gulp.dest(globals.prePath + globals.sitemodulePath));
}

gulp.task('default', function (done) {
  var prompts = [{
    name: 'compName',
    message: 'What is the name of your component?'
  }];
  inquirer.prompt(prompts, function (answers) {
    createComponent(answers);
    gulp.src(__dirname + '/templates/component/*.*')
      .pipe(template(answers))
      .pipe(rename(setFileName.bind(setFileName, answers.compNameHyph)))
      .pipe(conflict('./' + answers.compNameHyph))
      .pipe(gulp.dest('./' + answers.compNameHyph))
      .on('end', function () {
        done();
      });
  })
});

function createService(answers) {
  answers.srvName = camelCase(answers.srvName);
  answers.srvNameU = capitalizeFirstLetter(answers.srvName);
  answers.srvNameService = capitalizeFirstLetter(answers.srvName);
  answers.srvNameHyph = camelCaseToDash(answers.srvName);
  answers.path = globals.wrkdir.substr(globals.wrkdir.indexOf('modules'), globals.wrkdir.length - 1);

  getMainModuleSrc(globals.siteModule)
    .pipe(replace(globals.srvToken, '.service(' + answers.srvNameService + '.obName, ' + answers.srvNameService + ')\n' + globals.srvToken))
    .pipe(replace(globals.importSrvToken, "import " + answers.srvNameHyph + " from '../../" + answers.path + globals.sep + answers.srvNameHyph + ".srv'\n" + globals.importSrvToken))
    .pipe(gulp.dest(globals.prePath + globals.sitemodulePath));

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
        done();
      });
  })
});