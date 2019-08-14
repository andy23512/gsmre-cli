"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const command_exists_1 = __importDefault(require("command-exists"));
const fs_1 = __importDefault(require("fs"));
(() => __awaiter(this, void 0, void 0, function* () {
    const projectName = getProjectName();
    makeAndChangeDirectory(projectName);
    const packageManager = yield getPackageManager();
    yield installDevDependencies(packageManager);
    yield initTsConfig(packageManager);
}))().catch(console.error);
function getProjectName() {
    const projectName = process.argv[2];
    if (!projectName) {
        throw new Error('Error: No project name is given\nUsage: gsmre <project-name>');
    }
    else if (/[^A-Za-z0-9-]/.test(projectName)) {
        throw new Error('Error: Project name should only contain A-Z, a-z, 0-9 and hyphen');
    }
    return projectName;
}
function makeAndChangeDirectory(projectName) {
    fs_1.default.mkdirSync(projectName);
    process.chdir(projectName);
}
function getPackageManager() {
    return command_exists_1.default('yarn')
        .then(() => 'yarn')
        .catch(() => 'npm');
}
function installDevDependencies(packageManager) {
    const installDevDepsArgs = packageManager === 'yarn' ? ['add', '-D'] : ['install', '-D'];
    const devDeps = ['@types/node', 'ts-node', 'tslint', 'typescript'];
    return promiseSpawn(packageManager, [...installDevDepsArgs, ...devDeps]);
}
function initTsConfig(packageManager) {
    return promiseSpawn('./node_modules/.bin/tsc', ['--init']);
}
function promiseSpawn(command, args) {
    return new Promise((resolve, reject) => {
        child_process_1.default
            .spawn(command, args, { shell: true, stdio: 'inherit' })
            .on('close', code => (code === 0 ? resolve() : reject()));
    });
}
