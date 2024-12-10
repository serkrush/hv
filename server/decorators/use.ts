import 'reflect-metadata';

export default function USE(
    func: Function | Function[]
  ): (target: any, propertyKey?: string | undefined) => void {
    
    return (target: any, propertyKey?: string | undefined): void => 
    {
      let key: string = propertyKey
        ? target.constructor.name + '_' + propertyKey
        : target.name;
      let store: any = propertyKey ? target.constructor : target;
      let funcs = Reflect.getMetadata(key, store);
      const middleware = Array.isArray(func) ? func : [func];
      if (!Array.isArray(funcs) || funcs.length <= 0) {
        funcs = middleware;
      } else {
        funcs = [...middleware, ...funcs]; //!!! the order is important. 1) middleware 2) func
      }
      Reflect.defineMetadata(key, funcs, store);
    };
  }