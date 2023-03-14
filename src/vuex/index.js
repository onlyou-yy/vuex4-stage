import {useStore} from './injectKey'
import Store from './store'

/**
 * 创建store实例
 * @param {*} options 
 */
function createStore(options){
  return new Store(options)
}

export {
  useStore,
  createStore,
}