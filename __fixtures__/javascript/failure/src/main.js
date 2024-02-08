/* eslint-disable import/no-commonjs */

const core = require('@actions/core')

// eslint-disable-next-line @typescript-eslint/require-await
async function run() {
  core.setFailed('JavaScript Action Failed!')
}

module.exports = {
  run
}
