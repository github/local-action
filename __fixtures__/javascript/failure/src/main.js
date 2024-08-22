const { setFailed } = require('@actions/core')

async function run() {
  setFailed('JavaScript Action Failed!')
}

module.exports = {
  run
}
