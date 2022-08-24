import child_process from "child_process";
import commandExists from "command-exists";
import fs from "fs";

type PackageManager = "yarn" | "npm";

(async () => {
  const projectName = getProjectName();
  makeAndChangeDirectory(projectName);
  const packageManager = await getPackageManager();
  await initPackageJson(packageManager);
  addScripts();
  await installDevDependencies(packageManager);
  await initTsConfig();
  setTsConfig();
  setEslintConfig();
  addSampleTsFile();
})().catch(console.error);

function getProjectName() {
  const projectName = process.argv[2];
  if (!projectName) {
    throw new Error(
      "Error: No project name is given\nUsage: gsmre <project-name>"
    );
  } else if (/[^A-Za-z0-9-]/.test(projectName)) {
    throw new Error(
      "Error: Project name should only contain A-Z, a-z, 0-9 and hyphen"
    );
  }
  return projectName;
}

function makeAndChangeDirectory(projectName: string) {
  fs.mkdirSync(projectName);
  process.chdir(projectName);
}

async function getPackageManager(): Promise<PackageManager> {
  return commandExists("yarn")
    .then(() => "yarn" as const)
    .catch(() => "npm" as const);
}

function initPackageJson(packageManager: PackageManager) {
  return promiseSpawn(packageManager, ["init", "-y"]);
}

function installDevDependencies(packageManager: PackageManager) {
  const installDevDepsArgs =
    packageManager === "yarn" ? ["add", "-D"] : ["install", "-D"];
  const devDeps = [
    "@types/node",
    "ts-node",
    "typescript",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
  ];
  return promiseSpawn(packageManager, [...installDevDepsArgs, ...devDeps]);
}

function initTsConfig() {
  return promiseSpawn("./node_modules/.bin/tsc", ["--init"]);
}

function addScripts() {
  const pkg = JSON.parse(fs.readFileSync("./package.json").toString());
  pkg["scripts"] = {
    start: "ts-node src/index.ts",
    build: "tsc",
  };
  fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 2));
}

function setTsConfig() {
  let config = fs.readFileSync("./tsconfig.json", { encoding: "utf-8" });
  config = config.replace('// "outDir": "./",', '"outDir": "dist",');
  config = config.replace('"target": "es5",', '"target": "es6",');
  fs.writeFileSync("./tsconfig.json", config);
}

function setEslintConfig() {
  fs.writeFileSync(
    "./.eslintrc.js",
    `module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};`
  );
}

function addSampleTsFile() {
  fs.mkdirSync("src");
  fs.writeFileSync("./src/index.ts", "console.log('nanoha')");
}

function promiseSpawn(command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    child_process
      .spawn(command, args, { shell: true, stdio: "inherit" })
      .on("close", (code) => (code === 0 ? resolve(true) : reject()));
  });
}
