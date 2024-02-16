/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const core = require('@actions/core')

async function run() {
  const myInput = core.getInput('myInput')

  core.setOutput('myOutput', myInput)

  core.summary.addRaw('JavaScript Action Succeeded!')
  await core.summary.write()

  core.info('JavaScript Action Succeeded!')
}

module.exports = {
  run
}
