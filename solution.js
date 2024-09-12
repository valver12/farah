
function proxyInstance(Instance, getModule) {
    return class ProxiedInstance extends Instance {
      constructor(name) {
        super(name);
        this.installedModules = new Set(); 
      }
  
      async installModule(moduleName) {
        const moduleToInstall = getModule(moduleName);
        if (!moduleToInstall) {
          throw 'ERROR_MODULE_UNKNOWN';
        }
        if (this.isCircularDependency(moduleName, new Set())) {
          throw 'ERROR_MODULE_DEPENDENCIES';
        }
  
        await this.installWithDependencies(moduleName);
      }
  
      async installWithDependencies(moduleName) {
        const moduleToInstall = getModule(moduleName);
  
        if (this.installedModules.has(moduleName)) return;
  
        for (const dependency of moduleToInstall.requires) {
          await this.installWithDependencies(dependency);
        }
  
        await this.simpleInstallModule(moduleName);
        this.installedModules.add(moduleName); 
      }
  
      isCircularDependency(moduleName, seenModules) {
        if (seenModules.has(moduleName)) {
          return true;
        }
        
        seenModules.add(moduleName);
        const moduleToCheck = getModule(moduleName);
  
        for (const dependency of moduleToCheck.requires) {
          if (this.isCircularDependency(dependency, seenModules)) {
            return true;
          }
        }
  
        seenModules.delete(moduleName);
        return false;
      }
    };
  }
  
  module.exports = { proxyInstance };
  