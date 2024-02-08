/* eslint-disable import/no-commonjs */

const core = require('@actions/core')

// eslint-disable-next-line @typescript-eslint/require-await
async function run() {
  const myInput = core.getInput('myInput')
  core.setOutput('myOutput', myInput)
  core.info('JavaScript Action Succeeded!')
}

module.exports = {
  run
}
