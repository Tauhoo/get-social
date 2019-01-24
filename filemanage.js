const fs = require('fs')

const write = (text, social) => {
  return new Promise(resolve => {
    fs.writeFile(`./result/pantip/${social}.json`, text, function(err) {
      if (err) throw err
      resolve('save')
    })
  })
}

const append = (text, social) => {
  return new Promise(resolve => {
    fs.appendFile(`./result/pantip/${social}.json`, text, function(err) {
      if (err) throw err
      resolve('save')
    })
  })
}

module.exports = { write, append }
