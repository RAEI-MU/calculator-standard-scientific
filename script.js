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
    activeCalculator.clear();
}

standardSwitch.addEventListener('click', () => switchCalculatorMode('standard'));
scientificSwitch.addEventListener('click', () => switchCalculatorMode('scientific'));

class Calculator {
    constructor(mainDisplayId, secondaryDisplayId, totalAmountId) {
        this.mainDisplay = document.getElementById(mainDisplayId);
        this.secondaryDisplay = document.getElementById(secondaryDisplayId);
        this.totalAmountDisplay = document.getElementById(totalAmountId);
        this.clear();
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
            if (this.currentExpression === '0' && number !== '.') {
                this.currentExpression = number;
            } else if (number === '.' && this.currentExpression.includes('.')) {
                return;
            } else {
                this.currentExpression += number;
            }
        }
        this.updateDisplay();
    }

    appendOperator(operator) {
        this.isResultDisplayed = false;
        const lastChar = this.currentExpression.slice(-1);
        if (this.currentExpression === '' && operator === '-') {
            this.currentExpression = '-';
            this.updateDisplay();
            return;
        }
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
            while (this.parenthesisCount > 0) {
                evalExpression += ')';
                this.parenthesisCount--;
            }
            evalExpression = evalExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/([0-9.]+)\^([0-9.]+)/g, 'Math.pow($1, $2)')
                .replace(/mod/g, '%');
            const _tempFactorial = (n) => this.factorial(n);
            const _tempSin = (deg) => Math.sin(parseFloat(deg) * Math.PI / 180);
            const _tempCos = (deg) => Math.cos(parseFloat(deg) * Math.PI / 180);
            const _tempTan = (deg) => Math.tan(parseFloat(deg) * Math.PI / 180);
            const _tempAsin = (val) => (Math.asin(parseFloat(val)) * 180 / Math.PI);
            const _tempAcos = (val) => (Math.acos(parseFloat(val)) * 180 / Math.PI);
            const _tempAtan = (val) => (Math.atan(parseFloat(val)) * 180 / Math.PI);
            const _tempLog = (val) => Math.log(parseFloat(val));
            const _tempLog10 = (val) => Math.log10(parseFloat(val));
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
                .replace(/(\d+)!/g, `_tempFactorial($1)`);
            const allowedCharsRegex = /^[0-9+\-*/().\sPIMath_tempFactorial_tempSin_tempCos_tempTan_tempAsin_tempAcos_tempAtan_tempLog_tempLog10_tempSqrt_tempInv]+$/;
            if (!allowedCharsRegex.test(evalExpression)) {
                throw new Error("Invalid characters detected in expression.");
            }
            let result = eval(evalExpression);
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
        let lastNumber = null;
        const matchLastNum = this.currentExpression.match(/(\d+(\.\d+)?)$/);
        if (matchLastNum) {
            lastNumber = matchLastNum[0];
        }
        switch (func) {
            case 'pi':
            case 'e':
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
                this.currentExpression += '^';
                break;
            case 'sqrt':
                this.currentExpression += 'sqrt(';
                this.parenthesisCount++;
                break;
            case 'inv':
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
            case 'log':
            case 'log10':
                this.currentExpression += func + '(';
                this.parenthesisCount++;
                break;
            case 'mod':
                this.currentExpression += 'mod';
                break;
            case 'factorial_val':
                if (lastNumber) {
                    this.currentExpression = this.currentExpression.slice(0, -lastNumber.length) + `${lastNumber}!`;
                } else {
                    this.currentExpression += '!';
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
            let tempResult;
            try {
                let tempEvalExpression = this.currentExpression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/([0-9.]+)\^([0-9.]+)/g, 'Math.pow($1, $2)')
                    .replace(/mod/g, '%');
                tempResult = eval(tempEvalExpression);
            } catch (evalError) {
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
        this.totalAmountDisplay.textContent = this.mainDisplay.textContent;
    }
}

const standardCalc = new Calculator('standard-main-display', 'standard-secondary-display', 'standard-total-amount');
const scientificCalc = new Calculator('scientific-main-display', 'scientific-secondary-display', 'scientific-total-amount');

let activeCalculator = standardCalc;

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
            activeCalculator = calculatorInstance;
        });
    });
}

attachEventListeners(standardCalc, 'standard-calculator');
attachEventListeners(scientificCalc, 'scientific-calculator');

standardSwitch.addEventListener('click', () => {
    switchCalculatorMode('standard');
    activeCalculator = standardCalc;
});
scientificSwitch.addEventListener('click', () => {
    switchCalculatorMode('scientific');
    activeCalculator = scientificCalc;
});

standardCalc.clear();
scientificCalc.clear();

function addToHistory(expression, result) {
    if (!historyList) return;
    const li = document.createElement('li');
    li.textContent = `${expression} = ${result}`;
    historyList.prepend(li);
}
