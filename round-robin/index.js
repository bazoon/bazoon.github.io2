const defaultConfig = {
    timerPeriod: 1000,
    minWorkers: 10,
    maxWorkers: 20,
    minTasks: 10,
    maxTasks: 200,
    minProductivity: 20,
    maxProductivity: 80,
    minComplexity: 100,
    maxComplexity: 1000,
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatRandomString(nameLength = 10) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";

    while(nameLength--) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    return result;
}

class Settings {
    constructor(config) {
        this.timerPeriod = config.timerPeriod;
        this.minWorkers = config.minWorkers;
        this.maxWorkers = config.maxWorkers;
        this.minTasks = config.minTasks;
        this.maxTasks = config.maxTasks;
        this.minProductivity = config.minProductivity;
        this.maxProductivity = config.maxProductivity;
        this.minComplexity = config.minComplexity;
        this.maxComplexity = config.maxComplexity;     
    }

    save() {

    }

    load() {
        
    }

}

class Worker {
    constructor(name, productivity) {
        this.name = name;
        this.productivity = productivity;
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(task) {
        let index = this.tasks.indexOf(task);
        if (index !== -1) {
            this.tasks.splice(index, 1);
        }
    }

}

class WorkerFactory {
    constructor(config) {
        this.minProductivity = config.minProductivity;
        this.maxProductivity = config.maxProductivity;
        this.minWorkers = config.minWorkers;
        this.maxWorkers = config.maxWorkers;
    }

    generateWorker() {
        return new Worker(generatRandomString(), this.generateWorkerProductivity());
    }

    generateWorkers() {
        let workers = [];
        const numberOfWorkers = this.generateNumberOfWorkers();

        for (let index = 0; index < numberOfWorkers; index++) {
            workers.push(this.generateWorker());
        }
        
        return workers;
    }

    generateWorkerProductivity() {
        return getRandomInt(this.minProductivity, this.maxProductivity);
    }

    generateNumberOfWorkers() {
        return getRandomInt(this.minWorkers, this.maxWorkers);
    }
    
}

class Task {
    constructor(name, complexity) {
        this.name = name;
        this.initialComplexity = complexity;
        this.complexity = complexity;
    }
}

class TaskFactory {
    constructor(config) {
        this.minComplexity = config.minComplexity;
        this.maxComplexity = config.maxComplexity;
        this.minTasks = config.minTasks;
        this.maxTasks = config.maxTasks;
    }

    generateTask() {
        return new Task(generatRandomString(), getRandomInt(this.minComplexity, this.maxComplexity));
    }
    generateTasks() {
        const numberOfTasks = getRandomInt(this.minTasks, this.maxTasks);
        let tasks = [];
        
        for (let i = 0; i < numberOfTasks; i++) {
            tasks.push(this.generateTask());
        }

        return tasks;
    }
}


class RobinBobin {
    constructor(settings) {
        this.currentCycle = 0;
        this.settings = settings;
        this.isRunning = false;
        
        this.workerFactory = new WorkerFactory({
            minWorkers: this.settings.minWorkers,
            maxWorkers: this.settings.maxWorkers,
            minProductivity: this.settings.minProductivity,
            maxProductivity: this.settings.maxProductivity,
        });

        this.taskFactory = new TaskFactory({
            minComplexity: this.settings.minComplexity,
            maxComplexity: this.settings.maxComplexity,
            minTasks: this.settings.minTasks,
            maxTasks: this.settings.maxTasks,
        });

        this.workers = this.workerFactory.generateWorkers();
        this.tasks = this.taskFactory.generateTasks();
        this.assignTasks();
        this.setupEvents();
    }

    setupEvents() {
        const container = document.querySelector('.workers');
        container.addEventListener('click', this.handleWorkerClick.bind(this));
    }

    handleWorkerClick(e) {
        if (e.target.tagName === 'OPTION') {
            let workerName = e.target.dataset.workername;
            this.showWorkerInfo(workerName);
        }
    }

    showWorkerInfo(workerName) {
        let worker = this.workers.find((w) => w.name === workerName);
        const container = document.querySelector('.tasks');
        container.innerHTML = '';

        worker.tasks.forEach((task)=>{
            let taskElem = document.createElement('OPTION');
            taskElem.innerHTML = `${task.name}: ${task.complexity}`;
            container.appendChild(taskElem);
        });

    }

    assignTasks() {
        const numberOfWorkers = this.workers.length;

        this.tasks.forEach((task, index) => {
            let workerIndex = index % numberOfWorkers;
            this.workers[workerIndex].addTask(task);
        });
    }

    moveTasks() {
        for (let i = 0; i < this.workers.length - 1; i++) {
            let worker = this.workers[i];
            let nexWorker = this.workers[i + 1];

            let workerTask = worker.tasks[0];
            if (workerTask) {
                worker.removeTask(workerTask);
                nexWorker.addTask(workerTask);
            }
        }

        let firstWorker = this.workers[0];
        let lastWorker = this.workers[this.workers.length - 1];
        let lastTask = lastWorker.tasks[0];

        if (lastTask) {
            lastWorker.removeTask(lastTask);
            firstWorker.addTask(lastTask);
        }

        this.showWorkers();
    }

    randomMove() {
        if (Math.random() > 0.5) {
            this.moveTasks();
        }
    }

    showWorkers() {
        const container = document.querySelector('.workers');
        container.innerHTML = '';

        this.workers.forEach((worker) => {
            let w = document.createElement('option');
            let firstTask = worker.tasks[0];
            if (firstTask) {
                let firstTaskName = firstTask && firstTask.name;
                let firstTaskComplexity = firstTask && firstTask.complexity;
                w.innerHTML = `${worker.name}: ${worker.productivity} -- ${firstTaskName}: ${firstTaskComplexity}`;
                w.dataset.workername = worker.name;
                container.appendChild(w)
            }
        });
    }

    run() {
        this.showWorkers();
        this.isRunning = true;
        this.timerId = setInterval(this.oneCycle.bind(this), this.settings.timerPeriod);
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.timerId);
    }

    clear() {
        const workers = document.querySelector('.workers');
        const tasks = document.querySelector('.tasks');
        const info = document.querySelector('.info');
        
        workers.innerHTML = '';
        tasks.innerHTML = '';
        info.innerHTML = '';
    }

    oneCycle() {
        this.workers.forEach((worker) => {
            if (worker.tasks.length > 0) {
                let task = worker.tasks[0];
                task.complexity -= worker.productivity;
                if (task.complexity <= 0) {
                    worker.tasks.splice(0, 1);
                    this.showCompleted(worker, task);
                }
            }
        });
        
        this.randomMove();
        this.showWorkers();
        this.currentCycle++;
    }

    showCompleted(worker, task) {
        const container = document.querySelector('.info');
        const elem = document.createElement('OPTION');
        elem.innerHTML = `Цикл: ${this.currentCycle} Исполнитель: ${worker.name} Задача: ${task.name} Сложность: ${task.initialComplexity}`;
        container.appendChild(elem);
    }

}

class SettingsWindow {
    constructor(config) {
        this.windowSelector = config.windowSelector;
        this.window = document.querySelector(config.windowSelector);
        this.closeButton = this.window.querySelector(config.closeButtonSelector);
        this.saveButton = this.window.querySelector(config.saveButtonSelector);
        this.onSave = config.onSave;

        this.setupEvents();
    }

    setupEvents() {
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });

        this.saveButton.addEventListener('click', () => {
            this.save();
        });
    }

    show(config = {}) {
        this.window.classList.add('visible');
        this.populate(config);
    }

    populate(config) {
        const keys = Object.keys(config);
        keys.forEach((key) => {
            let field = this.window.querySelector(`.${key}`);
            field.value = config[key];
        });
    }

    hide() {
        this.window.classList.remove('visible');
    }

    save() {
        let config = {};
        const fields = Array.from(this.window.querySelectorAll('input'));
        fields.forEach((field) => {
            config[field.className] = +field.value;
        });

        this.onSave(config);
    }

}


class Application {

    constructor(defaultConfig) {
        let config = this.loadSettings();
        this.setup(config || defaultConfig);
        this.setupEvents();
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.config));
    }

    loadSettings() {
        let s = localStorage.getItem('settings');
        if (s) {
            return JSON.parse(s);
        }
    }

    setup(config) {
        this.config = config;
        this.settings = new Settings(config);
        this.robinBobin = new RobinBobin(this.settings);
    }

    setupEvents() {
        document.querySelector('#run').addEventListener('click', () => {
            let config = this.loadSettings();
            this.setup(config || defaultConfig);
            this.robinBobin.run(); 
        });
        
        document.querySelector('#stop').addEventListener('click', (e) => {
            if (this.robinBobin.isRunning) {
                this.robinBobin.stop(); 
                e.target.textContent = 'Resume';
            } else {
                this.robinBobin.run(); 
                e.target.textContent = 'Pause';
            }

        });
        
        document.querySelector('#clear').addEventListener('click', () => {
            this.robinBobin.clear(); 
        });

        document.querySelector('#settings').addEventListener('click', () => {
            var me = this;
            var settingsWindow = new SettingsWindow({
                windowSelector: '.settings-window',
                closeButtonSelector: '.settings-window__toolbar-close',
                saveButtonSelector: '.settings-window__toolbar-save',
                onSave: function (settings) {
                    me.setup(settings);
                    me.saveSettings();
                }
            });
            settingsWindow.show(this.config);
        });

    }
}

var app = new Application(defaultConfig);




