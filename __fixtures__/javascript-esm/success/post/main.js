const { getInput, info, setOutput } = require('@actions/core')

async function run() {
  const myInput = getInput('myInput')

  setOutput('myOutput', myInput)

  info('JavaScript Action Succeeded!')
}

module.exports = {
  run
}
