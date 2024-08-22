const { setFailed } = require('@actions/core')

async function run() {
  setFailed('JavaScript ESM Action Failed!')
}

module.exports = {
  run
}
