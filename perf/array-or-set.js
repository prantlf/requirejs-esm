const { createSuite } = require('./suite')
const { equal } = require('assert')

const skipModulesFew = [
  'lib/vendor/backbone',
  'lib/vendor/handlebars.helpers.xif',
  'lib/vendor/jquery',
  'lib/vendor/jquery.binary.ajax',
  'lib/vendor/jquery.mockjax',
  'lib/vendor/jquery.parse.param',
  'lib/vendor/jquery.when.all',
  'lib/vendor/jsonpath',
  'lib/vendor/marionette'
]
const skipModulesMany = [
  'lib/vendor/backbone',
  'lib/vendor/handlebars.helpers.xif',
  'lib/vendor/jquery',
  'lib/vendor/jquery.binary.ajax',
  'lib/vendor/jquery.mockjax',
  'lib/vendor/jquery.parse.param',
  'lib/vendor/jquery.when.all',
  'lib/vendor/jsonpath',
  'lib/vendor/marionette',
  'lib/vendor/marionette3',
  'lib/vendor/moment',
  'lib/vendor/moment-timezone',
  'lib/vendor/numeral',
  'lib/vendor/radio',
  'lib/vendor/fastclick',
  'lib/vendor/hammer',
  'lib/vendor/jquery.redraw',
  'lib/vendor/jquery.renametag',
  'lib/vendor/jquery.scrollbarwidth',
  'lib/vendor/jquery.touchSwipe',
  'lib/vendor/jquery.ui/js/jquery-ui',
  'lib/vendor/perfect-scrollbar',
  'lib/vendor/exif',
  'lib/vendor/alpaca/js/alpaca',
  'lib/vendor/ally',
  'lib/vendor/bootstrap3-typeahead',
  'lib/vendor/jquery.mousehover',
  'lib/vendor/fancytree/jquery.fancytree',
  'lib/vendor/fancytree/jquery.fancytree.filter',
  'lib/vendor/jquery.simulate',
  'lib/vendor/jquery.dataTables.bootstrap/js/dataTables.bootstrap',
  'lib/vendor/jquery.dataTables/js/jquery.dataTables',
  'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'
]
const skipModulesPrefix = [
  'lib/vendor/'
]
const skipModuleFewSet = new Set(skipModulesFew)
const skipModuleManySet = new Set(skipModulesMany)
const skipModulePrefixSet = new Set(skipModulesPrefix)

function usingArray(skipModules, name) {
  for (const skipModule of skipModules) {
    if (name.startsWith(skipModule)) return true
  }
  return false
}

function usingSet(skipModuleSet, name) {
  for (;;) {
    if (skipModuleSet.has(name)) return true
    // Accept a path prefix as well by cutting parts
    // of the module name by slashes from the right.
    const slash = name.lastIndexOf('/', name.length - 2)
    if (slash < 0) return false
    name = name.substring(0, slash + 1)
  }
}

async function checkModuleNames() {
  equal(usingArray(skipModulesFew, 'lib/vendor/marionette'), true)
  equal(usingArray(skipModulesFew, 'unknown'), false)
  equal(usingSet(skipModuleFewSet, 'lib/vendor/marionette'), true)
  equal(usingSet(skipModuleFewSet, 'unknown'), false)
  equal(usingArray(skipModulesMany, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'), true)
  equal(usingArray(skipModulesMany, 'lib/vendor/unknown'), false)
  equal(usingSet(skipModuleManySet, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'), true)
  equal(usingSet(skipModuleManySet, 'lib/vendor/unknown'), false)
  equal(usingArray(skipModulesPrefix, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'), true)
  equal(usingArray(skipModulesPrefix, 'lib/own/unknown'), false)
  equal(usingSet(skipModulePrefixSet, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'), true)
  equal(usingSet(skipModulePrefixSet, 'lib/own/unknown'), false)

  createSuite('Looking up module names...')
    .add('known using an array of few', () =>
      usingArray(skipModulesFew, 'lib/vendor/marionette'))
    .add('known using a set of few', () =>
      usingSet(skipModuleFewSet, 'lib/vendor/marionette'))
    .add('unknown using an array of few', () =>
      usingArray(skipModulesFew, 'unknown'))
    .add('unknown using a set of few', () =>
      usingSet(skipModuleFewSet, 'unknown'))
    .add('known using an array of many', () =>
      usingArray(skipModulesMany, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'))
    .add('known using a set of many', () =>
      usingSet(skipModuleManySet, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'))
    .add('unknown using an array of many', () =>
      usingArray(skipModulesMany, 'lib/vendor/unknown'))
    .add('unknown using a set of many', () =>
      usingSet(skipModuleManySet, 'lib/vendor/unknown'))
    .add('known using an array with a prefix', () =>
      usingArray(skipModulesPrefix, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'))
    .add('known using a set with a prefix', () =>
      usingSet(skipModulePrefixSet, 'lib/vendor/jquery.dataTables.tableTools/js/dataTables.tableTools'))
    .add('unknown using an array with a prefix', () =>
      usingArray(skipModulesMany, 'lib/own/unknown'))
    .add('unknown using a set with a prefix', () =>
      usingSet(skipModuleManySet, 'lib/own/unknown'))
    .start()
}

checkModuleNames().catch(error => {
  console.error(error)
  process.exitCode = 1
})
