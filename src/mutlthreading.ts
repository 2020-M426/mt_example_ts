const axios = require('axios');

const http = async () => {
    const httpRequests = 50;
    const httpCalls = Array<Promise<Response>>();
    const statusCodes = new Set();

    for (let index = 0; index < httpRequests; index++) {
        const url = `https://httpbin.org/status/${index + 200}`;
        httpCalls.push(callUrl(url));
    }

    console.log("== HTTP parallel ==");
    const start = process.hrtime();
    const results = Promise.all(httpCalls);
    (await results).forEach(response => { statusCodes.add(response.status); });
    const end = process.hrtime(start);
    console.log(`Execution time: ${(end[0] * 1000000000 + end[1]) / 1000000} ms`)
    console.assert(statusCodes.size == 50);

    console.log();
    console.log("== HTTP serial ==");
    const statusCodes2 = new Set();
    const start2 = process.hrtime();
    for (let index = 0; index < httpRequests; index++) {
        const url = `https://httpbin.org/status/${index + 200}`;
        const response = await axios.get(url);
        statusCodes2.add(response.status);
    }
    const end2 = process.hrtime(start2);
    console.log(`Execution time: ${(end2[0] * 1000000000 + end2[1]) / 1000000} ms`)
    console.assert(statusCodes2.size == 50);
}

const callUrl = async (url: string): Promise<Response> => {
    const response = axios.get(url);
    return response;
}

const calc = async () => {
    console.log();
    console.log("== Calc serial ==");
    const range = [...Array(12).keys()].map(v => 30 + v);
    var sum = 0;
    const start = process.hrtime();
    range.forEach(n => sum += fib(n));
    const end = process.hrtime(start);
    console.log(`Execution time: ${(end[0] * 1000000000 + end[1]) / 1000000} ms`)
    console.assert(sum == 432148168);

    console.log();
    console.log("== Calc parallel ==");
    var sum = 0;
    const start2 = process.hrtime();
    const result = Promise.all(range.map(n => fib(n)));
    (await result).map(n => sum += n);
    const end2 = process.hrtime(start2);
    console.log(`Execution time: ${(end2[0] * 1000000000 + end2[1]) / 1000000} ms`)
    console.assert(sum == 432148168);
}

const fib = (n: number): number => {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

// Call start
(async () => {
    await http();
    await calc();
})();