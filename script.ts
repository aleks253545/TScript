function sortEx(a, b) {
    if (a.experience > b.experience) return 1;
    if (a.experience == b.experience) return 0;
    if (a.experience < b.experience) return -1;
}
interface IDirector {
    mobileProject: object[];
    webProjects: object[];
    completeProject: number;
    layOffProgrammer: number;
    recruitProgrammer: number;
    firstDay(): void
    newDay(): void
    addNewProjects(projects: object[])
    transferProjectToDepartament(): void
    recruitProgrammers(Project:object[],object): void
}
class Director implements IDirector {
    mobileProject = [];
    webProjects = [];
    completeProject = 0;
    layOffProgrammer = 0;
    recruitProgrammer = 0;
    constructor() {
    }
    firstDay() {
        director.addNewProjects(generationProjects());
    }
    newDay() {
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
    }
    //запуск событий нового дня
    addNewProjects(projects) {
        projects.forEach((element: ProjectsInterface): void => {
            if (element.direction === 'web')
                this.webProjects.push(element);
            else if (element.direction === 'mobile')
                this.mobileProject.push(element);
        });
    }
    //получение директором проектов для компании 
    transferProjectToDepartament() {
        web.addNewProjects(this.webProjects.splice(0, web.freeProgrammers.length));
        mobile.addNewProjects(this.mobileProject.splice(0, mobile.freeProgrammers.length));
    }
    //перередача необходимого количества проектов в отделы
    recruitProgrammers(mass, departement) {
        let programmers:object[] = [],
            i:number = mass.length;
        while (i > departement.projects.length) {
            programmers.push(new Programmer);
            i--;
        }
        this.recruitProgrammer += programmers.length;
        departement.addProgrammers(programmers);
    }
    //наем програмистов в отделы
}
interface IDepartament {
    projects:object[];
    freeProgrammers:object[];
    workProgremmers:object[];
    checkCompleteProject():void
    addNewProjects(projects:object[]):void
    addProgrammers(programmes:object[]):void
    addProgrammers(programmes:object[]):void
    assignProject():void
    endDay():void
    layoff():void
}
class Departement implements IDepartament{
    projects = [];
    freeProgrammers = [];
    workProgremmers = [];
    constructor() {

    }
    checkCompleteProject() {
        this.projects.forEach((item, index) => {
            if (item.time == 1) {
                item.activeProgrammer.experience++;
                if (item.helpProgrammer.length !== 0) {
                    item.helpProgrammer.forEach(item => { item.experience++ });
                    this.freeProgrammers.push(...item.helpProgrammer);
                    item.helpProgrammer = false;
                }
                this.freeProgrammers.push(this.workProgremmers.splice(this.workProgremmers.indexOf(item.activeProgrammer), 1)[0]);
                item.activeProgrammer = false;
                this.projects.splice(index, 1);
                QA.addNewProjects(item);
            }

        })
    }
    //проверка на наличие выполненных проектов в конце дня
    addNewProjects(projects) {
        this.projects.push(...projects);
    }
    //добавление проектов в массив проектов отдела
    addProgrammers(programmes) {
        this.freeProgrammers.push(...programmes);
    }
    // добавление программистов
    assignProject() {
        this.projects.forEach(items => {
            if (items.activeProgrammer == false) {
                this.freeProgrammers[0].dayOutOfWork = 0;
                items.activeProgrammer = this.freeProgrammers[0];
                this.workProgremmers.push(this.freeProgrammers.splice(0, 1)[0]);
            }
        })
    }
    //распределение программистов на проекты
    endDay() {
        this.layoff();
        this.projects.forEach(item => {
            item.newDayProject();
        })
        this.checkCompleteProject();
    }
    // событие нового дня 
    layoff() {
        let layoffList:object[];
        this.freeProgrammers.forEach(item => { item.dayOutOfWork++ });
        layoffList = this.freeProgrammers.filter(item => { item.dayOutOfWork >= 3 }).sort(sortEx);
        if (layoffList.length !== 0) {
            this.freeProgrammers.splice(this.freeProgrammers.indexOf(layoffList[0]), 1);
            director.layOffProgrammer++;
        }

    }
    //проверка на бездельников
}

class mobileDepartament extends Departement implements IDepartament{
    assignProject() {

        super.assignProject();
        this.projects.forEach((item) => {
            if (!item.inDevelopment && 0 < item.complexity - 1 && item.complexity - 1 <= this.freeProgrammers.length) {
                item.helpProgrammer.push(...this.freeProgrammers.splice(0, item.complexity - 1));
                this.workProgremmers.push(...this.freeProgrammers.splice(0, item.complexity - 1));
                item.helpProgrammer.forEach(item => { item.dayOutOfWork = 0; });
                item.norm = item.complexity;
            }
            item.inDevelopment = true;
        })
    }
    // добавленние к методу для мобильного отдела , который позволяет при наличии свободных программистов после распределения проектов отправить их на уже занятые проекты в помощь
}
interface IQA extends IDepartament{
    addNewProjects(project:object):void
    recruitProgrammers():void
}
class webDepartament extends Departement {

}
class QADepartament extends Departement  implements IQA{
    addNewProjects(project) {
        this.projects.push(project);
    }
    //немного другой механизм добавления проектов для QA центра
    recruitProgrammers() {
        while (this.projects.length > this.freeProgrammers.length) {
            this.freeProgrammers.push(new Programmer);
            director.recruitProgrammer++;
        }
    }
    // ненмого другой механизм для наема рабочих по надобности
    endDay() {
        this.layoff();
        this.projects.forEach(item => {
            item.newDayProject();
        });
        director.completeProject += this.projects.length;
        this.projects.splice(0, this.projects.length);
        this.workProgremmers.forEach(item => { item.experience++ });
        this.freeProgrammers = this.freeProgrammers.concat(this.workProgremmers);
        this.workProgremmers.splice(0, this.workProgremmers.length);
    }
    // отдельное собыие конца дня с удалением проектов 

}
interface ProjectI {
    activeProgrammer: boolean | object
    complete: boolean
    norm: number
    inDevelopment: boolean
    newDayProject(): void
}
interface ProjectsInterface extends ProjectI {
    helpProgrammer: object[] | []
    direction: string
    complexity: number
    time: number
}
class Project implements ProjectI {
    activeProgrammer = false;
    complete = false;
    norm = 1;
    inDevelopment = false;
    constructor() {
    }
    newDayProject() {
    }
    // новый день для каждого проекта


}
class webProject extends Project implements ProjectsInterface {
    helpProgrammer = [];
    direction = 'web';
    complexity: number
    time
    constructor(complexity: number) {
        super();
        this.complexity = complexity;
        this.time = complexity + 1;
    }
    newDayProject() {
        this.time -= this.norm;
    }
    // новый день для каждого проекта

}
class mobileProject extends Project implements ProjectsInterface {
    helpProgrammer = [];
    direction = 'mobile';
    complexity
    time
    constructor(complexity: number) {
        super()
        this.complexity = complexity;
        this.time = complexity + 1;
    }
    newDayProject() {
        this.time -= this.norm;
    }
    // новый день для каждого проекта

}
class MobileCreater {
    create(complexity: number) {
        return new mobileProject(complexity);
    }
}
class WebCreater {
    create(complexity: number) {
        return new webProject(complexity);
    }
}
class Programmer {
    experience: number = 0;
    dayOutOfWork: number = 0;
}
let director:IDirector = new Director,
    mobile: Departement = new mobileDepartament,
    web: Departement = new webDepartament,
    QA: QADepartament = new QADepartament;

function generationProjects(): { activeProgrammer: boolean | object, complete: boolean, complexity: number, direction: string, helpProgrammer: [object], inDevelopment: boolean, norm: number, time: number }[] {
    let quantity :number = Math.floor(Math.random() * 4);
    let projects = [];

    while (quantity + 1) {
        let direction: boolean = (Math.floor(Math.random() * 2) == 1);
        let complexity: number = (Math.floor(Math.random() * 3 + 1));
        let factiory = (direction == false) ? new WebCreater : new MobileCreater;
        projects.push(factiory.create(complexity));
        quantity--;
    }
    return projects;
}
// фукнция генерации проектов 
function work(days): { projects: number, layOffProgrammer: number, recruitProgrammer: number } {
    let i = 1;
    while (i <= days) {
        if (i == 1) {
            director.firstDay();
        } else {
            director.newDay();
        }
        i++;
    }
    return {
        projects: director.completeProject,
        layOffProgrammer: director.layOffProgrammer,
        recruitProgrammer: director.recruitProgrammer
    }
}
// главная функция
console.log(work(12));
// update  добавил фабрику для проектов ,сейчас она по большей части вообще не нужна , но это самое логичное место для ее использования, но больше она нигде по моему мнению не нужна , для других паттернов не вижу причин добавления вообще