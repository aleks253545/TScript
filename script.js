var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function sortEx(a, b) {
    if (a.experience > b.experience)
        return 1;
    if (a.experience == b.experience)
        return 0;
    if (a.experience < b.experience)
        return -1;
}
var Director = /** @class */ (function () {
    function Director() {
        this.mobileProject = [];
        this.webProjects = [];
        this.completeProject = 0;
        this.layOffProgrammer = 0;
        this.recruitProgrammer = 0;
    }
    Director.prototype.firstDay = function () {
        director.addNewProjects(generationProjects());
    };
    Director.prototype.newDay = function () {
        this.recruitProgrammers(this.mobileProject, mobile);
        this.recruitProgrammers(this.webProjects, web);
        QA.recruitProgrammers();
        this.addNewProjects(generationProjects());
        this.transferProjectToDepartament();
        web.assignProject();
        mobile.assignProject();
        QA.assignProject();
        QA.endDay();
        web.endDay();
        mobile.endDay();
    };
    //запуск событий нового дня
    Director.prototype.addNewProjects = function (projects) {
        var _this = this;
        projects.forEach(function (element) {
            if (element.direction === 'web')
                _this.webProjects.push(element);
            else if (element.direction === 'mobile')
                _this.mobileProject.push(element);
        });
    };
    //получение директором проектов для компании 
    Director.prototype.transferProjectToDepartament = function () {
        web.addNewProjects(this.webProjects.splice(0, web.freeProgrammers.length));
        mobile.addNewProjects(this.mobileProject.splice(0, mobile.freeProgrammers.length));
    };
    //перередача необходимого количества проектов в отделы
    Director.prototype.recruitProgrammers = function (mass, departement) {
        var programmers = [], i = mass.length;
        while (i > departement.projects.length) {
            programmers.push(new Programmer);
            i--;
        }
        this.recruitProgrammer += programmers.length;
        departement.addProgrammers(programmers);
    };
    return Director;
}());
var Departement = /** @class */ (function () {
    function Departement() {
        this.projects = [];
        this.freeProgrammers = [];
        this.workProgremmers = [];
    }
    Departement.prototype.checkCompleteProject = function () {
        var _this = this;
        this.projects.forEach(function (item, index) {
            var _a;
            if (item.time == 1) {
                item.activeProgrammer.experience++;
                if (item.helpProgrammer.length !== 0) {
                    item.helpProgrammer.forEach(function (item) { item.experience++; });
                    (_a = _this.freeProgrammers).push.apply(_a, item.helpProgrammer);
                    item.helpProgrammer = false;
                }
                _this.freeProgrammers.push(_this.workProgremmers.splice(_this.workProgremmers.indexOf(item.activeProgrammer), 1)[0]);
                item.activeProgrammer = false;
                _this.projects.splice(index, 1);
                QA.addNewProjects(item);
            }
        });
    };
    //проверка на наличие выполненных проектов в конце дня
    Departement.prototype.addNewProjects = function (projects) {
        var _a;
        (_a = this.projects).push.apply(_a, projects);
    };
    //добавление проектов в массив проектов отдела
    Departement.prototype.addProgrammers = function (programmes) {
        var _a;
        (_a = this.freeProgrammers).push.apply(_a, programmes);
    };
    // добавление программистов
    Departement.prototype.assignProject = function () {
        var _this = this;
        this.projects.forEach(function (items) {
            if (items.activeProgrammer == false) {
                _this.freeProgrammers[0].dayOutOfWork = 0;
                items.activeProgrammer = _this.freeProgrammers[0];
                _this.workProgremmers.push(_this.freeProgrammers.splice(0, 1)[0]);
            }
        });
    };
    //распределение программистов на проекты
    Departement.prototype.endDay = function () {
        this.layoff();
        this.projects.forEach(function (item) {
            item.newDayProject();
        });
        this.checkCompleteProject();
    };
    // событие нового дня 
    Departement.prototype.layoff = function () {
        var layoffList;
        this.freeProgrammers.forEach(function (item) { item.dayOutOfWork++; });
        layoffList = this.freeProgrammers.filter(function (item) { item.dayOutOfWork >= 3; }).sort(sortEx);
        if (layoffList.length !== 0) {
            this.freeProgrammers.splice(this.freeProgrammers.indexOf(layoffList[0]), 1);
            director.layOffProgrammer++;
        }
    };
    return Departement;
}());
var mobileDepartament = /** @class */ (function (_super) {
    __extends(mobileDepartament, _super);
    function mobileDepartament() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    mobileDepartament.prototype.assignProject = function () {
        var _this = this;
        _super.prototype.assignProject.call(this);
        this.projects.forEach(function (item) {
            var _a, _b;
            if (!item.inDevelopment && 0 < item.complexity - 1 && item.complexity - 1 <= _this.freeProgrammers.length) {
                (_a = item.helpProgrammer).push.apply(_a, _this.freeProgrammers.splice(0, item.complexity - 1));
                (_b = _this.workProgremmers).push.apply(_b, _this.freeProgrammers.splice(0, item.complexity - 1));
                item.helpProgrammer.forEach(function (item) { item.dayOutOfWork = 0; });
                item.norm = item.complexity;
            }
            item.inDevelopment = true;
        });
    };
    return mobileDepartament;
}(Departement));
var webDepartament = /** @class */ (function (_super) {
    __extends(webDepartament, _super);
    function webDepartament() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return webDepartament;
}(Departement));
var QADepartament = /** @class */ (function (_super) {
    __extends(QADepartament, _super);
    function QADepartament() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QADepartament.prototype.addNewProjects = function (project) {
        this.projects.push(project);
    };
    //немного другой механизм добавления проектов для QA центра
    QADepartament.prototype.recruitProgrammers = function () {
        while (this.projects.length > this.freeProgrammers.length) {
            this.freeProgrammers.push(new Programmer);
            director.recruitProgrammer++;
        }
    };
    // ненмого другой механизм для наема рабочих по надобности
    QADepartament.prototype.endDay = function () {
        this.layoff();
        this.projects.forEach(function (item) {
            item.newDayProject();
        });
        director.completeProject += this.projects.length;
        this.projects.splice(0, this.projects.length);
        this.workProgremmers.forEach(function (item) { item.experience++; });
        this.freeProgrammers = this.freeProgrammers.concat(this.workProgremmers);
        this.workProgremmers.splice(0, this.workProgremmers.length);
    };
    return QADepartament;
}(Departement));
var Project = /** @class */ (function () {
    function Project() {
        this.activeProgrammer = false;
        this.complete = false;
        this.norm = 1;
        this.inDevelopment = false;
    }
    Project.prototype.newDayProject = function () {
    };
    return Project;
}());
var webProject = /** @class */ (function (_super) {
    __extends(webProject, _super);
    function webProject(complexity) {
        var _this = _super.call(this) || this;
        _this.helpProgrammer = [];
        _this.direction = 'web';
        _this.complexity = complexity;
        _this.time = complexity + 1;
        return _this;
    }
    webProject.prototype.newDayProject = function () {
        this.time -= this.norm;
    };
    return webProject;
}(Project));
var mobileProject = /** @class */ (function (_super) {
    __extends(mobileProject, _super);
    function mobileProject(complexity) {
        var _this = _super.call(this) || this;
        _this.helpProgrammer = [];
        _this.direction = 'mobile';
        _this.complexity = complexity;
        _this.time = complexity + 1;
        return _this;
    }
    mobileProject.prototype.newDayProject = function () {
        this.time -= this.norm;
    };
    return mobileProject;
}(Project));
var MobileCreater = /** @class */ (function () {
    function MobileCreater() {
    }
    MobileCreater.prototype.create = function (complexity) {
        return new mobileProject(complexity);
    };
    return MobileCreater;
}());
var WebCreater = /** @class */ (function () {
    function WebCreater() {
    }
    WebCreater.prototype.create = function (complexity) {
        return new webProject(complexity);
    };
    return WebCreater;
}());
var Programmer = /** @class */ (function () {
    function Programmer() {
        this.experience = 0;
        this.dayOutOfWork = 0;
    }
    return Programmer;
}());
var director = new Director, mobile = new mobileDepartament, web = new webDepartament, QA = new QADepartament;
function generationProjects() {
    var quantity = Math.floor(Math.random() * 4);
    var projects = [];
    while (quantity + 1) {
        var direction = (Math.floor(Math.random() * 2) == 1);
        var complexity = (Math.floor(Math.random() * 3 + 1));
        var factiory = (direction == false) ? new WebCreater : new MobileCreater;
        projects.push(factiory.create(complexity));
        quantity--;
    }
    return projects;
}
// фукнция генерации проектов 
function work(days) {
    var i = 1;
    while (i <= days) {
        if (i == 1) {
            director.firstDay();
        }
        else {
            director.newDay();
        }
        i++;
    }
    return {
        projects: director.completeProject,
        layOffProgrammer: director.layOffProgrammer,
        recruitProgrammer: director.recruitProgrammer
    };
}
// главная функция
console.log(work(12));
// update  добавил фабрику для проектов ,сейчас она по большей части вообще не нужна , но это самое логичное место для ее использования, но больше она нигде по моему мнению не нужна , для других паттернов не вижу причин добавления вообще
