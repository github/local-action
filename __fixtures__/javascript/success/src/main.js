/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable import/no-commonjs */

const core = require('@actions/core')

async function run() {
  const myInput = core.getInput('myInput')
  core.setOutput('myOutput', myInput)
  core.info('JavaScript Action Succeeded!')
}

module.exports = {
  run
}
