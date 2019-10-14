const { client } = require('nightwatch-api')
const { After, Before, Given, Then } = require('cucumber')
const webdavHelper = require('../helpers/webdavHelper')
const fs = require('fs')
let createdFiles = []

Given('a file with the size of {string} bytes and the name {string} has been created locally', function (size, name) {
  const fullPathOfLocalFile = client.globals.filesForUpload + name
  const fh = fs.openSync(fullPathOfLocalFile, 'w')
  fs.writeSync(fh, 'A', Math.max(0, size - 1))
  fs.closeSync(fh)
  createdFiles.push(fullPathOfLocalFile)
})

Then('the error message {string} should be displayed on the webUI', function (folder) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@message')
    .expect.element('@message').text.to.equal(folder)
})

Then('the error message {string} should be displayed on the webUI dialog prompt', function (message) {
  return client
    .page.phoenixPage()
    .waitForElementVisible('@ocDialogPromptAlert')
    .expect.element('@ocDialogPromptAlert').text.to.equal(message)
})

Then('no message should be displayed on the webUI', function () {
  return client
    .page.phoenixPage()
    .expect.element('@message').to.not.be.present
})

Then('as {string} the content of {string} should be the same as the local {string}', function (userId, remoteFile, localFile) {
  const fullPathOfLocalFile = client.globals.filesForUpload + localFile
  return webdavHelper
    .download(userId, remoteFile)
    .then(body => assertContentOFLocalFileIs(fullPathOfLocalFile, body))
})

const assertContentOFLocalFileIs = function (fullPathOfLocalFile, expectedContent) {
  const actualContent = fs.readFileSync(fullPathOfLocalFile, { encoding: 'utf-8' })
  return client.assert.strictEqual(
    actualContent, expectedContent, 'asserting content of local file "' + fullPathOfLocalFile + '"'
  )
}

Before(function (testCase) {
  createdFiles = []
  if (typeof process.env.SCREEN_RESOLUTION !== 'undefined' && process.env.SCREEN_RESOLUTION.trim() !== '') {
    const resolution = process.env.SCREEN_RESOLUTION.split('x')
    resolution[0] = parseInt(resolution[0])
    resolution[1] = parseInt(resolution[1])
    if (resolution[0] > 1 && resolution[1] > 1) {
      client.resizeWindow(resolution[0], resolution[1])
      console.log('\nINFO: setting screen resolution to ' + resolution[0] + 'x' + resolution[1] + '\n')
    } else {
      console.warn('\nWARNING: invalid resolution given, running tests in full resolution!\n')
      client.maximizeWindow()
    }
  } else {
    client.maximizeWindow()
  }
  console.log('  ' + testCase.sourceLocation.uri + ':' + testCase.sourceLocation.line + '\n')
})

After(function (testCase) {
  console.log('\n  Result: ' + testCase.result.status + '\n')
  createdFiles.forEach(fileName => fs.unlinkSync(fileName))
})
