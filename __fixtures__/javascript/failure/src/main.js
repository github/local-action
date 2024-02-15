/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable import/no-commonjs */

const core = require('@actions/core')

async function run() {
  core.setFailed('JavaScript Action Failed!')
}

module.exports = {
  run
}
