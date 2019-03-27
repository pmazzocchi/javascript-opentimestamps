const test = require('tape')
const ExplorerList = require('../src/explorer-list.js')

test('explorer-list.js test', assert => {
  assert.pass('This test will pass.')

  assert.end()
})

test('ExplorerList blockhash test', assert => {
  const m = new ExplorerList.ExplorerList()
  const resultPromise = m.blockhash(0)
  resultPromise.then(result => {
    assert.equals(result, '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', 'genesis block matches')
    assert.end()
  }).catch(err => {
    assert.fail('err=' + err)
  })
})

test('ExplorerList block test', assert => {
  const m = new ExplorerList.ExplorerList()
  const resultPromise = m.block('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f')
  resultPromise.then(result => {
    assert.equals(result.merkleroot, '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', 'genesis block merkle root matches')
    assert.end()
  }).catch(err => {
    assert.fail('err=' + err)
  })
})
