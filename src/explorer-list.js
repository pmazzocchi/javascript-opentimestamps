'use strict'

/**
 * ExplorerList module.
 * @module ExplorerList
 * @author federicoon, fametrano
 * @license LPGL3
 */

const Promise = require('promise')
const Utils = require('./utils.js')
const Insight = require('./insight.js')
const Blockstream = require('./blockstream.js')

const defaultExplorers = {}
defaultExplorers.bitcoin = [
  { url: 'https://blockstream.info/api',             type: 'blockstream' },
  { url: 'https://insight.bitpay.com/api',           type: 'insight' },
  { url: 'https://blockexplorer.com/api',            type: 'insight' },
  { url: 'https://bitcore.schmoock.net/insight-api', type: 'insight' }
]
defaultExplorers.litecoin = [
  { url: 'https://ltc-bitcore1.trezor.io/api',       type: 'insight' },
  { url: 'https://insight.litecore.io/api',          type: 'insight' }
]

class ExplorerList {
  /** Constructor
   * @param {Object}   options - The option arguments.
   * @param {String}   options.chain: blockchain {bitcoin|litecoin|...}
   * @param {number}   options.timeout: timeout (in seconds) for the calls to explorer servers
   * @param {Object[]} options.explorers: array of block explorer server objects
   * @param {String}   options.explorers[].url: block explorer server url
   * @param {String}   options.explorers[].type: block explorer server type: {insight|blockstream}
   */
  constructor (options) {
    this.explorers = []

    const chainOptionSet = options && Object.prototype.hasOwnProperty.call(options, 'chain')
    const chain = chainOptionSet ? options.chain : 'bitcoin'

    const timeoutOptionSet = options && Object.prototype.hasOwnProperty.call(options, 'timeout')
    const timeout = timeoutOptionSet ? options.timeout : 10

    const explorersOptionSet = options && Object.prototype.hasOwnProperty.call(options, 'explorers') && options.explorers.length > 1
    const explorers = explorersOptionSet ? options.explorers : defaultExplorers[chain]

    explorers.forEach(explorer => {
      if (typeof (explorer.url) !== 'string') {
        throw new TypeError('URL must be a string')
      }
      var expl
      if (explorer.type && explorer.type === 'insight') {
        expl = new Insight.Insight(explorer.url, timeout)
      } else if (explorer.type && explorer.type === 'blockstream') {
        expl = new Blockstream.Blockstream(explorer.url, timeout)
      } else {
        throw new RangeError('unknown explorer type')
      }
      this.explorers.push(expl)
    })

  }

  blockhash (height) {
    const res = []
    this.explorers.forEach(explorer => {
      res.push(explorer.blockhash(height))
    })
    return new Promise((resolve, reject) => {
      Promise.all(res.map(Utils.softFail)).then(results => {
        const set = new Set()
        results.filter(result => { if (result && !(result instanceof Error)) { set.add(JSON.stringify(result)) } })
        if (set.size === 0) {
          reject(new Error('No block height ' + height + 'found'))
        } else if (set.size === 1) {
          resolve(JSON.parse(set.values().next().value))
        } else {
          reject(new Error('Different block height ' + height + 'found'))
        }
      })
    })
  }

  block (hash) {
    const res = []
    this.explorers.forEach(explorer => {
      res.push(explorer.block(hash))
    })
    return new Promise((resolve, reject) => {
      Promise.all(res.map(Utils.softFail)).then(results => {
        const set = new Set()
        results.filter(result => { if (result && !(result instanceof Error)) { set.add(JSON.stringify(result)) } })
        if (set.size === 0) {
          reject(new Error('No block hash ' + hash + 'found'))
        } else if (set.size === 1) {
          resolve(JSON.parse(set.values().next().value))
        } else {
          reject(new Error('Different block hash ' + hash + 'found'))
        }
      })
    })
  }
}

module.exports = { ExplorerList }
