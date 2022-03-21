const arrB = [...arrA, "cVal", ...invalid, ...["eVal", "fVal"]];

document.body.innerHTML = arrB[4];

export {};
