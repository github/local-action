/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const core = require('@actions/core')

async function run() {
  core.summary.addRaw('JavaScript Action Failed!')
  await core.summary.write()

  core.setFailed('JavaScript Action Failed!')
}

module.exports = {
  run
}
