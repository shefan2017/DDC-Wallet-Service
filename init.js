module.exports = async function () {
  console.log('enter dapp init')

  app.registerContract(1000, 'domain.register')
  app.registerContract(1001, 'domain.set_ip')
  // app.registerContract(1002,'log.postLogs')
  // app.registerContract(1003,'log.addTimeL')
  // app.registerContract(1004,'log.decrease')
  // app.registerContract(1005,'log.createLogs')
  // app.registerContract(1006,'log.updateLogs')
  // app.registerContract(1007,'log.deleteLogs')
  app.registerContract(2000,"area.addArea")
  app.registerContract(2001,"area.addLand")
  app.setDefaultFee('10000000', 'Dream.DDC')

  app.events.on('newBlock', (block) => {
    console.log('new block received', block.height)
  })
}