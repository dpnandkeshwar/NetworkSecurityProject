export function logTitledJson(name: string, dataJson: string) {
    console.log(`\x1b[34m${name}\x1b[0m\n${JSON.stringify(JSON.parse(dataJson), undefined, 2)}`);
}

export function logTitledObject(name: string, data: Object) {
    console.log(`\x1b[34m${name}\x1b[0m\n${JSON.stringify(data, undefined, 2)}`);
}

export function logTitledString(name: string, data: string) {
    console.log(`\x1b[34m${name}\x1b[0m\n${data}`);
}