
const solution = require('./solution');  

const instances = [
    { name: 'instance0', installed: {} },
    { name: 'instance1', installed: {} },
    { name: 'instance2', installed: {} },
    { name: 'instance3', installed: {} },
    { name: 'instance4', installed: {} }
];

const modules = [
    { name: 'module1', requires: [] },
    { name: 'module2', requires: ['module1'] },
    { name: 'module3', requires: ['module1', 'module2'] },
    { name: 'module4', requires: ['module3'] },
    { name: 'module5', requires: ['module3', 'module1'] },
    { name: 'module6', requires: ['module7', 'module1'] },
    { name: 'module7', requires: ['module8'] },
    { name: 'module8', requires: ['module6'] }
];

const LOOP_ERROR = 'Found dependency loop';
let loggedError;
let loop = null;

const namedGetter = (array, defaultValue) => query =>
    array.find(({ name }) => name === query) || defaultValue;

const getInstance = namedGetter(instances, {});
const getModule = namedGetter(modules);

const assertInstanceHasModules = (index, names, message) => {
    const installed = Object.keys(instances[index].installed);
    installed.sort();
    names.sort();
    if (
        installed.length !== names.length ||
        !installed.every((name, index) => (names[index] === name))
    ) {
        throw new Error(message);
    }
};


const ALREADY_INSTALL_ERROR = 'A module was installed twice';
const MISSING_DEPENDENCY_ERROR = 'A module is installed without its dependencies';
const WRONG_ERROR_ERROR = 'Should reject on unknown module with error code ERROR_MODULE_UNKNOWN';
const UNKNOWN_DEPENDENCY_ERROR = 'Should reject on unknown module';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class Instance {
    constructor(name) {
        this.name = name;
    }
    async getInstalledModuleNames() {
        if (loop && --loop === 0) {
            loggedError = LOOP_ERROR;
            throw LOOP_ERROR;
        }
        await sleep(50);
        return Object.keys(getInstance(this.name).installed || {});
    }
    async simpleInstallModule(name) {
        const installed = getInstance(this.name).installed || {};
        const mod = getModule(name);
        if (!mod) {
            loggedError = UNKNOWN_DEPENDENCY_ERROR;
            throw UNKNOWN_DEPENDENCY_ERROR;
        }
        if (installed[name]) {
            loggedError = ALREADY_INSTALL_ERROR;
            throw ALREADY_INSTALL_ERROR;
        }
        (mod.requires || []).forEach(name => {
            if (!installed[name]) {
                loggedError = MISSING_DEPENDENCY_ERROR;
                throw MISSING_DEPENDENCY_ERROR;
            }
        });

        if (installed[name]) {
            loggedError = ALREADY_INSTALL_ERROR;
            throw ALREADY_INSTALL_ERROR;
        }
        if (loop && --loop === 0) {
            loggedError = LOOP_ERROR;
            throw LOOP_ERROR;
        }
        await sleep(50);
        installed[name] = true;
    }
}

const ProxiedInstance = solution.proxyInstance(Instance, getModule);

const test0 = async () => { 
    const instance0 = new ProxiedInstance('instance0');
    if (instance0.name !== 'instance0') {
        return new Error('Instance does not have the right name');
    }
    await instance0.installModule('module1');
    assertInstanceHasModules(0, ['module1'], 'Missing installed module');
    await instance0.installModule('module1');
    assertInstanceHasModules(0, ['module1'], 'Missing already installed module');
    await instance0.installModule('module2');
    assertInstanceHasModules(0, ['module1', 'module2'], 'Missing installed module with dependency');
    await instance0.installModule('module3');
    assertInstanceHasModules(0, ['module1', 'module2', 'module3'], 'Missing installed module with multiple dependencies');
    console.log('Testing simple install: OK');
};

const test1 = async () => {
    const instance1 = new ProxiedInstance('instance1');
    await instance1.installModule('module3');
    assertInstanceHasModules(1, ['module1', 'module2', 'module3'], 'Missing module or its dependencies');
    console.log('Testing dependencies install: OK');
};

const test2 = async () => {
    const instance2 = new ProxiedInstance('instance2');
    await instance2.installModule('module4');
    assertInstanceHasModules(2, ['module1', 'module2', 'module3', 'module4'], 'Missing module or its multiple dependencies');
    console.log('Testing multiple dependencies install: OK');
};

const test3 = async () => {
    const instance3 = new ProxiedInstance('instance3');
    await instance3.installModule('module5');
    assertInstanceHasModules(3, ['module1', 'module2', 'module3', 'module5'], 'Missing module or its multiple dependencies');
    console.log('Testing multiple crossed dependencies: OK');
};

const test4 = async () => {
    const instance4 = new ProxiedInstance('instance4');
    await instance4.installModule('moduleX').then(
        () => {
            loggedError = UNKNOWN_DEPENDENCY_ERROR;
            throw new Error('Should reject on unknown module');
        },
        errorCode => {
            if (errorCode !== 'ERROR_MODULE_UNKNOWN') {
                loggedError = WRONG_ERROR_ERROR;
                throw new Error('Should reject on unknown module with error code ERROR_MODULE_UNKNOWN');
            }
        }
    );

    assertInstanceHasModules(4, [], 'There should be no module on the instance after trying to install an unknown module');

    loop = 100;
    await instance4.installModule('module6').then(
        () => {
            loggedError = LOOP_ERROR;
            throw new Error('Should reject if dependency loop');
        },
        errorCode => {
            if (errorCode !== 'ERROR_MODULE_DEPENDENCIES') {
                loggedError = WRONG_ERROR_ERROR;
                throw new Error('Should reject if dependency loop with error code ERROR_MODULE_DEPENDENCIES');
            }
        }
    );

    assertInstanceHasModules(4, [], 'There should be no module on the instance after trying to install module with invalid dependencies');
    console.log('Testing reject cases: OK');
};


(async () => {
    try {
        await test0();
        await test1();
        await test2();
        await test3();
        await test4();
    } catch (err) {
        console.error('Some of the tests are still failing.', err || '');
    }

    if (loggedError) {
        throw loggedError;
    }
    console.log('All works as expected.');
})();
