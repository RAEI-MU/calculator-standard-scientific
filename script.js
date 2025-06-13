const standardSwitch = document.getElementById('standard-switch');
const scientificSwitch = document.getElementById('scientific-switch');
const standardCalculator = document.getElementById('standard-calculator');
const scientificCalculator = document.getElementById('scientific-calculator');
const historyList = document.getElementById('history-list');

let currentMode = 'standard';

function switchCalculatorMode(mode) {
    if (currentMode === mode) return;

    if (mode === 'standard') {
        standardCalculator.classList.add('active');
        scientificCalculator.classList.remove('active');
        standardSwitch.classList.add('active');
        scientificSwitch.classList.remove('active');
    } else {
        standardCalculator.classList.remove('active');
        scientificCalculator.classList.add('active');
        standardSwitch.classList.remove('active');
        scientificSwitch.classList.add('active');
    }
    currentMode = mode;
    // Clear display when switching modes
    activeCalculator.clear();
}

standardSwitch.addEventListener('click', () => switchCalculatorMode('standard'));
scientificSwitch.addEventListener('click', () => switchCalculatorMode('scientific'));

// --- Kalkulator Utama (Class-based untuk Modularitas) ---
class Calculator {
    constructor(mainDisplayId, secondaryDisplayId, totalAmountId) {
        this.mainDisplay = document.getElementById(mainDisplayId);
        this.secondaryDisplay = document.getElementById(secondaryDisplayId);
        this.totalAmountDisplay = document.getElementById(totalAmountId);
        this.clear(); // Initialize state
    }

    clear() {
        this.currentExpression = '';
        this.mainDisplay.textContent = '0';
        this.secondaryDisplay.textContent = '';
        this.totalAmountDisplay.textContent = '0';
        this.lastResult = null;
        this.isResultDisplayed = false;
        this.parenthesisCount = 0;
    }

    appendNumber(number) {
        if (this.isResultDisplayed) {
            this.currentExpression = number;
            this.isResultDisplayed = false;
        } else {
            // Prevent multiple leading zeros (e.g., "007")
            if (this.currentExpression === '0' && number !== '.') {
                this.currentExpression = number;
            } else if (number === '.' && this.currentExpression.includes('.')) { // Perbaiki cek titik desimal
                return;
            } else {
                this.currentExpression += number;
            }
        }
        this.updateDisplay();
    }

    appendOperator(operator) {
        this.isResultDisplayed = false; // Allow typing numbers after operator

        const lastChar = this.currentExpression.slice(-1);

        // Jika ekspresi kosong dan operator adalah '-' (untuk angka negatif awal)
        if (this.currentExpression === '' && operator === '-') {
            this.currentExpression = '-';
            this.updateDisplay();
            return;
        }

        // Ganti operator terakhir jika operator berturut-turut ditekan
        if (['+', '-', '*', '/'].includes(lastChar)) {
            this.currentExpression = this.currentExpression.slice(0, -1) + operator;
        } else {
            this.currentExpression += operator;
        }
        this.updateDisplay();
    }

    handleParenthesis(value) {
        if (this.isResultDisplayed) {
            this.currentExpression = '';
            this.isResultDisplayed = false;
        }

        if (value === '(') {
            this.parenthesisCount++;
            this.currentExpression += '(';
        } else if (value === ')') {
            if (this.parenthesisCount > 0) {
                this.parenthesisCount--;
                this.currentExpression += ')';
            }
        }
        this.updateDisplay();
    }

    // Fungsi faktorial di luar eval() untuk kejelasan dan efisiensi
    factorial(n) {
        if (!Number.isInteger(n) || n < 0) {
            throw new Error("Invalid input for factorial. Must be a non-negative integer.");
        }
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    calculate() {
        if (this.currentExpression === '') return;

        try {
            const expressionForHistory = this.currentExpression;
            let evalExpression = this.currentExpression;

            // Pastikan semua tanda kurung terbuka ditutup untuk evaluasi
            while (this.parenthesisCount > 0) {
                evalExpression += ')';
                this.parenthesisCount--;
            }

            // LANGKAH 1: Ganti simbol yang tidak dikenal oleh JS dan operator pangkat
            evalExpression = evalExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/([0-9.]+)\^([0-9.]+)/g, 'Math.pow($1, $2)') // Handle x^y
                .replace(/mod/g, '%');

            // LANGKAH 2: Ganti fungsi saintifik, pastikan argumennya dievaluasi jika itu ekspresi
            // Ini adalah bagian yang paling menantang dengan eval().
            // Solusi terbaik adalah parser RPN.
            // Untuk sementara, kita akan mencoba mengevaluasi argumen fungsi secara terpisah
            // Atau, kita bisa membuat fungsi JS yang sesuai yang akan dipanggil oleh eval()

            // Define temporary helper functions for eval if needed
            // This is a workaround for eval's limitation on parsing nested functions easily
            const _tempFactorial = (n) => this.factorial(n);
            const _tempSin = (deg) => Math.sin(parseFloat(deg) * Math.PI / 180);
            const _tempCos = (deg) => Math.cos(parseFloat(deg) * Math.PI / 180);
            const _tempTan = (deg) => Math.tan(parseFloat(deg) * Math.PI / 180);
            const _tempAsin = (val) => (Math.asin(parseFloat(val)) * 180 / Math.PI);
            const _tempAcos = (val) => (Math.acos(parseFloat(val)) * 180 / Math.PI);
            const _tempAtan = (val) => (Math.atan(parseFloat(val)) * 180 / Math.PI);
            const _tempLog = (val) => Math.log(parseFloat(val)); // Natural Log
            const _tempLog10 = (val) => Math.log10(parseFloat(val)); // Base 10 Log
            const _tempSqrt = (val) => Math.sqrt(parseFloat(val));
            const _tempInv = (val) => (1 / parseFloat(val));


            evalExpression = evalExpression
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin\(([^)]+)\)/g, `_tempSin($1)`)
                .replace(/cos\(([^)]+)\)/g, `_tempCos($1)`)
                .replace(/tan\(([^)]+)\)/g, `_tempTan($1)`)
                .replace(/asin\(([^)]+)\)/g, `_tempAsin($1)`)
                .replace(/acos\(([^)]+)\)/g, `_tempAcos($1)`)
                .replace(/atan\(([^)]+)\)/g, `_tempAtan($1)`)
                .replace(/log\(([^)]+)\)/g, `_tempLog($1)`)
                .replace(/log10\(([^)]+)\)/g, `_tempLog10($1)`)
                .replace(/sqrt\(([^)]+)\)/g, `_tempSqrt($1)`)
                .replace(/inv\(([^)]+)\)/g, `_tempInv($1)`)
                .replace(/(\d+)!/g, `_tempFactorial($1)`); // Faktorial


            // Untuk debugging, lihat ekspresi yang akan dievaluasi
            console.log("Eval Expression:", evalExpression);

            // Validasi karakter yang diizinkan sebelum eval (disesuaikan)
            // Karakter yang diizinkan: angka, operator dasar, ., spasi, Math, PI, E, nama fungsi JS yang digunakan, _tempFunctions
            const allowedCharsRegex = /^[0-9+\-*/().\sPIMath_tempFactorial_tempSin_tempCos_tempTan_tempAsin_tempAcos_tempAtan_tempLog_tempLog10_tempSqrt_tempInv]+$/;
            if (!allowedCharsRegex.test(evalExpression)) {
                throw new Error("Invalid characters detected in expression.");
            }

            let result = eval(evalExpression); // DANGER: Use with caution!

            if (!Number.isFinite(result)) {
                if (isNaN(result)) {
                    throw new Error("Result is Not a Number (NaN)");
                } else if (result === Infinity || result === -Infinity) {
                    throw new Error("Division by zero");
                }
            }

            result = parseFloat(result.toFixed(10));

            this.mainDisplay.textContent = result;
            this.totalAmountDisplay.textContent = result;
            this.lastResult = result;
            this.currentExpression = result.toString();
            this.isResultDisplayed = true;
            this.parenthesisCount = 0;

            addToHistory(expressionForHistory, result);
        } catch (error) {
            this.mainDisplay.textContent = 'Error';
            this.totalAmountDisplay.textContent = 'Error';
            this.lastResult = null;
            this.currentExpression = '';
            this.isResultDisplayed = true;
            this.parenthesisCount = 0;
            console.error('Calculation error:', error.message);
        }
    }

    handleScientificFunction(func) {
        if (this.isResultDisplayed) {
            this.currentExpression = this.lastResult !== null ? this.lastResult.toString() : '';
            this.isResultDisplayed = false;
        }

        // Variabel untuk menyimpan argumen jika fungsi diterapkan ke angka terakhir
        let lastNumber = null;
        const matchLastNum = this.currentExpression.match(/(\d+(\.\d+)?)$/);
        if (matchLastNum) {
            lastNumber = matchLastNum[0];
        }

        switch (func) {
            case 'pi':
            case 'e':
                // Hindari menambahkan PI/E langsung setelah angka tanpa operator
                if (lastNumber !== null && (lastNumber !== '' || this.currentExpression.endsWith('.'))) {
                    this.currentExpression += '*' + (func === 'pi' ? 'π' : 'e');
                } else {
                    this.currentExpression += (func === 'pi' ? 'π' : 'e');
                }
                break;
            case 'x^2':
                if (lastNumber) {
                    this.currentExpression = this.currentExpression.slice(0, -lastNumber.length) + `(${lastNumber})^2`;
                } else {
                    this.currentExpression += '^2';
                }
                break;
            case 'x^y':
                this.currentExpression += '^'; // Operator pangkat kustom
                break;
            case 'sqrt':
                this.currentExpression += 'sqrt(';
                this.parenthesisCount++;
                break;
            case 'inv': // 1/x
                if (lastNumber) {
                    this.currentExpression = this.currentExpression.slice(0, -lastNumber.length) + `inv(${lastNumber})`;
                } else {
                    this.currentExpression += 'inv(';
                    this.parenthesisCount++;
                }
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'asin':
            case 'acos':
            case 'atan':
            case 'log': // Natural log
            case 'log10': // Base 10 log
                this.currentExpression += func + '(';
                this.parenthesisCount++;
                break;
            case 'mod':
                this.currentExpression += 'mod'; // Tambahkan 'mod' sebagai penanda
                break;
            case 'factorial_val': // Menggunakan data-value yang berbeda
                if (lastNumber) {
                    this.currentExpression = this.currentExpression.slice(0, -lastNumber.length) + `${lastNumber}!`;
                } else {
                    this.currentExpression += '!'; // Membiarkan pengguna mengetik angka diikuti !
                }
                break;
            default:
                break;
        }
        this.updateDisplay();
    }

    handlePercentage() {
        if (this.currentExpression === '') return;
        try {
            // Evaluasi ekspresi saat ini, lalu terapkan persentase
            let tempResult;
            try {
                // Gunakan eval() untuk mendapatkan nilai numerik dari ekspresi saat ini
                // Lakukan penggantian yang sama seperti di calculate() untuk evaluasi internal
                let tempEvalExpression = this.currentExpression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/([0-9.]+)\^([0-9.]+)/g, 'Math.pow($1, $2)')
                    .replace(/mod/g, '%');
                // Untuk fungsi saintifik di persentase, Anda mungkin perlu mengevaluasinya juga
                tempResult = eval(tempEvalExpression);
            } catch (evalError) {
                // Jika ekspresi tidak valid untuk eval sebelum %, gunakan angka terakhir
                const lastNumMatch = this.currentExpression.match(/(\d+(\.\d+)?)$/);
                if (lastNumMatch) {
                    tempResult = parseFloat(lastNumMatch[0]);
                } else {
                    throw new Error("Invalid expression for percentage.");
                }
            }

            if (!isNaN(tempResult)) {
                const percentageValue = tempResult / 100;
                this.currentExpression = percentageValue.toString();
                this.updateDisplay();
                this.isResultDisplayed = true;
            } else {
                throw new Error("Cannot calculate percentage.");
            }
        } catch (error) {
            this.mainDisplay.textContent = 'Error';
            this.totalAmountDisplay.textContent = 'Error';
            this.currentExpression = '';
            this.isResultDisplayed = true;
            console.error('Percentage calculation error:', error.message);
        }
    }

    updateDisplay() {
        this.mainDisplay.textContent = this.currentExpression === '' ? '0' : this.currentExpression;
        this.secondaryDisplay.textContent = this.currentExpression;

        // Total amount display harus mencerminkan apa yang ada di main display
        this.totalAmountDisplay.textContent = this.mainDisplay.textContent;
    }
}

// Instantiate calculators
const standardCalc = new Calculator('standard-main-display', 'standard-secondary-display', 'standard-total-amount');
const scientificCalc = new Calculator('scientific-main-display', 'scientific-secondary-display', 'scientific-total-amount');

let activeCalculator = standardCalc; // Keep track of the currently active calculator instance

// Fungsi untuk menambahkan event listener ke setiap tombol
function attachEventListeners(calculatorInstance, containerId) {
    const buttons = document.querySelectorAll(`#${containerId} .button`);
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            const value = button.dataset.value;

            if (type === 'number') {
                calculatorInstance.appendNumber(value);
            } else if (type === 'operator') {
                calculatorInstance.appendOperator(value);
            } else if (type === 'clear') {
                calculatorInstance.clear();
            } else if (type === 'equals') {
                calculatorInstance.calculate();
            } else if (type === 'percent') {
                calculatorInstance.handlePercentage();
            } else if (type === 'function') {
                if (value === '(' || value === ')') {
                    calculatorInstance.handleParenthesis(value);
                } else {
                    calculatorInstance.handleScientificFunction(value);
                }
            }
            // Update active calculator reference after a click
            activeCalculator = calculatorInstance;
        });
    });
}

// Attach listeners to both calculators
attachEventListeners(standardCalc, 'standard-calculator');
attachEventListeners(scientificCalc, 'scientific-calculator');

// Override switch mode to update activeCalculator instance
standardSwitch.addEventListener('click', () => {
    switchCalculatorMode('standard');
    activeCalculator = standardCalc;
});
scientificSwitch.addEventListener('click', () => {
    switchCalculatorMode('scientific');
    activeCalculator = scientificCalc;
});

// Initial clear for both calculators
standardCalc.clear();
scientificCalc.clear();

// History
function addToHistory(expression, result) {
    if (!historyList) return;
    const li = document.createElement('li');
    li.textContent = `${expression} = ${result}`;
    historyList.prepend(li);
}