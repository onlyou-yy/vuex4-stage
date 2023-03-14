import { forEachValue } from "../utils";
import Module from "./module";

//生成结构化数据，生成模块化数据
export default class ModuleCollection{
  constructor(rootModule){
    this.root = null;
    this.register(rootModule,[]);
  }

  register(rawModule,path){
    let newModule = new Module(rawModule);
    if(path.length === 0){
      this.root = newModule
    }else{
      // 因为 concat 方法并不会修改原数组，所以 path 得到的会是一条不包含兄弟节点的数组
      /**
       * root
       *  -A
       *    -C
       *  -B
       */
      //得到的是[A,C],[B]
      const parent = path.slice(0,-1).reduce((module,current)=>{
        return module.getChild(current);
      },this.root);
      parent.addChild(path[path.length - 1],newModule);
    }

    if(rawModule.modules){
      forEachValue(rawModule.modules,(rawChildModule,key)=>{
        this.register(rawChildModule,path.concat(key))
      })
    }
  }

  //获取命名空间字符串
  getNamespaced(path){
    let module = this.root;
    return path.reduce((namespacedStr,key)=>{
      module = module.getChild(key);
      return namespacedStr + (module.namespaced ? key + '/' : '')
    },'')
  }
}