module.exports = {
    /**
     * Given an existing javascript class representing an Instance and a function which
     * retrieve a module description, the function below 'proxyInstance' should return a new class
     * that provides the same functionalities as the provided Instance class, and add the method
     * 'installModule' with this signature:
     *
     *    * @param {String} moduleName
     *    * @return {Promise} resolve only when the module is installed (or already there),
     *    * reject if it cannot be installed with the following error code:
     *    * - 'ERROR_MODULE_UNKNOWN' if the module does not exist
     *    * - 'ERROR_MODULE_DEPENDENCIES' if the module cannot be installed because of its dependencies
     *    installModule(moduleName) {}
     *
     * Calling this method should install a module and its dependencies on the instance.
     * It shouldn't install the same module twice, it should respect the hierarchy of
     * dependencies, and it should not install any module if the requested module cannot
     * be installed.
     *
     *
     *
     *
     * Regarding the arguments of 'proxyInstance':
     *
     *
     * The 'Instance' class already has the following methods:
     *
     *    * @returns Promise which resolves with the list of already installed modules.
     *    getInstalledModuleNames() {}
     *
     *    * @param {String} moduleName
     *    * @returns {Promise} resolves when the module is installed. It will crash if a module
     *    * is already installed, or if one of the dependencies of the module is not already installed.
     *    * You should not rely on the crash to test the dependencies, you should check them before.
     *    simpleInstallModule(moduleName) {}
     *
     * The two methods above can randomly fail by rejecting the returned promise,
     * but the installModule of the new class must be failsafe. It should only reject
     * if there is no way this module can be install (ex: wrong module name)
     *
     * You can also assume that no other processes are interacting with the instance, so if
     * a module is not installed on the instance, it will not be added unless tryInstallModule
     * is called successfully.
     *
     *
     * 'getModule' is a function with the following signature
     *
     *    * @param {String} name
     *    * @return {Object} a module description, which have following structure:
     *        {
     *            name: 'THE MODULE NAME',
     *            // list of modules which have to be on the instance before this module is installed
     *            requires: ['A DEPENDENT MODULE', 'ANOTHER DEPENDENT MODULE']
     *        }
     *
     *
     * @param {class} Instance
     * @param {Function} getModulesFactory
     * @return {class}
     */
    proxyInstance(Instance, getModule) {

        return class ProxiedInstance extends Instance {
            async installModule(moduleName) {
                // here goes your proposed solution
            }
        };
    }
};
