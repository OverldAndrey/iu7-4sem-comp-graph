const   container = document.getElementById('canvas');


container["mode"] = 1;


class Line {
    constructor(x1, y1, x2, y2) {
        this.p1 = [];
        this.p2 = [];
        this.set(...arguments)
    }

    set(x1, y1, x2, y2) {
        this.p1 = [x1, y1];
        this.p2 = [x2, y2];
    }

    draw() {
        line(...(this.p1), ...(this.p2));
    }
}


class Cutter {
    constructor() {
        this.sides = [];
    }

    set_edge(i, p1, p2) {
        this.sides[i].set(...p1, ...p2);
    }

    add_edge(p1, p2) {
        this.sides.push(new Line(...p1, ...p2));
    }

    draw() {
        for (let l = this.sides[0], i = 0; i < this.sides.length; i++, l = this.sides[i]) {
            l.draw();
        }
    }

    // clear_cutter() {
    //     noStroke();
    //     fill(255, 255, 255);
    //     rect(...(this.sides[0].p1), this.sides[0].p2[0]-this.sides[0].p1[0], this.sides[3].p2[1]-this.sides[3].p1[1]);
    //     noFill();
    // }

    reset() {
        this.sides = [];
    }
}


class Scene {
    constructor() {
        this.lines = [];
        this.l_color = [0, 0, 0];
        this.c_color = [255, 0, 0];
        this.i_color = [200, 200, 200];
        this.cutter = new Cutter();
    }

    set_color(l_c, c_c, i_c) {
        this.l_color = convertColor(document.getElementById(l_c).value);
        this.c_color = convertColor(document.getElementById(c_c).value);
        this.i_color = convertColor(document.getElementById(i_c).value);
    }

    add_line(p1, p2) {
        this.lines.push(new Line(...p1, ...p2));
    }

    add_cutter_side(p1, p2) {
        this.cutter.add_edge(p1, p2);
    }

    set_cutter_side(i, p1, p2) {
        this.cutter.set_edge(i, p1, p2);
    }

    clear() {
        this.lines = [];
        this.cutter.reset();
    }

    clear_lines() {
        this.lines = [];
    }

    clear_cutter() {
        this.cutter.reset();
    }

    draw_raw() {
        stroke(this.c_color);
        this.cutter.draw();

        stroke(this.l_color);
        for (let l = this.lines[0], i = 0; i < this.lines.length; i++, l = this.lines[i]) {
            l.draw();
        }
    }

    search_nearest_cutter_side(pt) {
        let l = Infinity;
        let res;

        for (let s = this.cutter.sides[0], j = 0, pp = pt; j < this.cutter.sides.length; j++, s = this.cutter.sides[j]) {
            let a = Math.sqrt((s.p2[0]-s.p1[0])**2+(s.p2[1]-s.p1[1])**2),
                b = Math.sqrt((pp[0]-s.p1[0])**2+(pp[1]-s.p1[1])**2),
                c = Math.sqrt((pp[0]-s.p2[0])**2+(pp[1]-s.p2[1])**2),
                p = (a+b+c)/2,
                l1 = 2/a*Math.sqrt(p*(p-a)*(p-b)*(p-c));

            if (l1 < l) {
                l = l1;
                res = s;
            }
        }

        return res;
    }

    search_nearest_lines_side(pt) {
        let l = Infinity;
        let res;

        for (let s = this.lines[0], j = 0, pp = pt; j < this.lines.length; j++, s = this.lines[j]) {
            let a = Math.sqrt((s.p2[0]-s.p1[0])**2+(s.p2[1]-s.p1[1])**2),
                b = Math.sqrt((pp[0]-s.p1[0])**2+(pp[1]-s.p1[1])**2),
                c = Math.sqrt((pp[0]-s.p2[0])**2+(pp[1]-s.p2[1])**2),
                p = (a+b+c)/2,
                l1 = 2/a*Math.sqrt(p*(p-a)*(p-b)*(p-c));

            if (l1 < l) {
                l = l1;
                res = s;
            }
        }

        return res;
    }

    check_cutter() {
        let vm = [];

        for (let s = this.cutter.sides[0], j = 0; j < this.cutter.sides.length; j++, s = this.cutter.sides[j]) {
            let j1 = (j+1 === this.cutter.sides.length) ? 0 : j+1;

            let vec_mult = (s1, s2) => [0, 0, s1[0]*s2[1]-s1[1]*s2[0]];

            vm.push(Math.sign(vec_mult([s.p2[0]-s.p1[0], s.p2[1]-s.p1[1]], [this.cutter.sides[j1].p2[0]-this.cutter.sides[j1].p1[0], this.cutter.sides[j1].p2[1]-this.cutter.sides[j1].p1[1]])[2]));
        }

        let res = 1;
        for (let j = 0; j < vm.length && res === 1; j++) {
            let j1 = (j+1 === vm.length) ? 0 : j+1;
            res *= vm[j]*vm[j1];
        }

        return res;
    }

    _check_visible(s1, s2, p) {
        let vec_mult = (s1, s2) => [0, 0, s1[0]*s2[1]-s1[1]*s2[0]],
            si1 = Math.sign(vec_mult([s1.p2[0]-s1.p1[0], s1.p2[1]-s1.p1[1]], [s2.p2[0]-s2.p1[0], s2.p2[1]-s2.p1[1]])[2]),
            si2 = Math.sign(vec_mult([s1.p2[0]-s1.p1[0], s1.p2[1]-s1.p1[1]], [p[0]-s1.p1[0], p[1]-s1.p1[1]])[2]);

        return si1 *
               si2 > 0;
    }

    _check_collide(ct, s, p) {
        let x1 = ct.p1[0], y1 = ct.p1[1],
            x2 = ct.p2[0], y2 = ct.p2[1],
            x3 = s[0], y3 = s[1],
            x4 = p[0], y4 = p[1],
            z = ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4)).toFixed(5);
        let x = ((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-x4*y3))/z,
            y = ((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-x4*y3))/z;

        if (x1 === x2) {
            x = x1;
            y = -(y4-y3)/(x4-x3)*(x4-x)+y4;
        }
        if (x3 === x4) {
            x = x3;
            y = -(y2-y1)/(x2-x1)*(x2-x)+y2;
        }
        x = Math.round(x);
        y = Math.round(y);

        let t = (z === 0) ? s : [x, y];

        return {"fact":(x >= Math.min(Math.round(s[0]), Math.round(p[0])) && x <= Math.max(Math.round(s[0]), Math.round(p[0])) &&
                y >= Math.min(Math.round(s[1]), Math.round(p[1])) && y <= Math.max(Math.round(s[1]), Math.round(p[1]))), "t": t};
    }

    __check_collide(ct, s, p) {
        let k1 = (s[0]-ct.p1[0])/(ct.p2[0]-ct.p1[0]),
            k2 = (p[0]-s[0])/(ct.p2[0]-ct.p1[0]),
            k3 = (s[1]-ct.p1[1])/(ct.p2[1]-ct.p1[1]),
            k4 = (p[1]-s[1])/(ct.p2[1]-ct.p1[1]),
            t2 = (k3-k1)/(k2-k4),
            t1 = k1+k2*t2,
            x = s[0]+(p[0]-s[0])*t2,
            y = s[1]+(p[1]-s[1])*t2;
        let t = ((ct.p2[1]-ct.p1[1])/(ct.p2[0]-ct.p1[0]) === (p[1]-s[1])/(p[0]-s[0])) ? s : [x, y];

        return {"fact":(x >= Math.min(s[0], p[0]) && x <= Math.max(s[0], p[0]) &&
                y >= Math.min(s[1], p[1]) && y <= Math.max(s[1], p[1])), "t": t};
    }

    draw_cut() {
        stroke(this.i_color);
        for (let l = this.lines[0], i = 0; i < this.lines.length; i++, l = this.lines[i]) {
            l.draw();
        }
        stroke(this.c_color);
        this.cutter.draw();

        stroke(this.l_color);
        strokeWeight(2);

        let A = [],
            Na = this.lines.length;
        for (let i = 0; i < this.lines.length; i++) {A.push(this.lines[i].p1)}

        for (let i = 0; i < this.cutter.sides.length; i++) {
            let Nb = 0,
                B = [],
                S = A[0],
                F = A[0];
            let i1 = (i+1 === this.cutter.sides.length) ? 0 : i+1;

            S = A[0];
            if (this._check_visible(this.cutter.sides[i], this.cutter.sides[i1], S)) {
                B[Nb] = S;
                Nb++;
            }

            for (let j = 1; j < A.length; j++) {
                let collide = this._check_collide(this.cutter.sides[i], S, A[j]);
                if (collide.fact) {
                    B[Nb] = collide.t;
                    Nb++;
                }
                S = A[j];
                if (this._check_visible(this.cutter.sides[i], this.cutter.sides[i1], S)) {
                    B[Nb] = S;
                    Nb++;
                }
            }

            if (Nb === 0) {
                A = [];
                Na = 0;
                break;
            }

            let collide = this._check_collide(this.cutter.sides[i], S, F);
            if (collide.fact) {
                B[Nb] = collide.t;
                Nb++;
            }

            A = B;
            Na = Nb;

            // window.draw();
            // stroke(this.i_color);
            // for (let l = this.lines[0], i = 0; i < this.lines.length; i++, l = this.lines[i]) {
            //     l.draw();
            // }
            // stroke(this.c_color);
            // this.cutter.draw();
            //
            // stroke(this.l_color);
            // strokeWeight(2);
            //
            // let nsides = [];
            // for (let i = 0; i < Na-1; i++) {
            //     nsides.push(new Line(...A[i], ...A[i+1]));
            // }
            // nsides.push(new Line(...A[Na-1], ...A[0]));
            //
            // for (let l = nsides[0], i = 0; i < nsides.length; i++, l = nsides[i]) {
            //     l.draw();
            // }
        }

        if (A.length === 0) {return;}

        let nsides = [];
        for (let i = 0; i < Na-1; i++) {
            nsides.push(new Line(...A[i], ...A[i+1]));
        }
        nsides.push(new Line(...A[Na-1], ...A[0]));

        for (let l = nsides[0], i = 0; i < nsides.length; i++, l = nsides[i]) {
            l.draw();
        }
    }
}


let scene = new Scene();


function setup() {
    let canvas = createCanvas(container.clientWidth, container.clientWidth);

    canvas.parent('canvas');
    canvas.class("border no-gutters");
    canvas.id("canvasPage");

    noLoop();

    window.onresize = resize.bind(this);
}

function draw() {
    noStroke();
    fill(255, 255, 255);
    rect(0, 0, width, height);
    noFill();

    stroke(0, 0, 0);
    strokeWeight(1);
    scene.draw_raw();
}


function resize() {
    canvas.style.width = container.clientWidth + "px";
    canvas.style.height = container.clientWidth + "px";
}

function checkInput(reg, str) {
    if (str.match(reg) != str) {
        alert("Incorrect input!");
        return false;
    }
    return true;
}

function convertColor(clr) {
    return clr.substring(1).split('').reduce((res, e, i) => {if (i % 2 === 0) {res.push(e)} else {res[res.length-1]+=e} return res;}, []).map(e => parseInt(e, 16));
}

function click_listener() {
    let ev = window.event;
    loop();

    if (ev.which === 3)
        return;

    if (container.mode === 1) {
        if (!scene.p1) {
            scene.lines = [];
            scene.p1 = [ev.pageX-container.offsetLeft, ev.pageY-container.offsetTop];
        } else {
            scene.p1 = scene.lines[scene.lines.length-1].p2;
        }

        scene.add_line(scene.p1, scene.p1);
    } else if (container.mode === 2) {
        if (!scene.p1) {
            scene.cutter.reset();
            scene.p1 = [ev.pageX-container.offsetLeft, ev.pageY-container.offsetTop];
        } else {
            scene.p1 = scene.cutter.sides[scene.cutter.sides.length-1].p2;
        }

        scene.add_cutter_side(scene.p1, scene.p1);
    }

    container.addEventListener("mousemove", move_listener);
}

function move_listener() {
    let ev2 = window.event;
    let p2 = [ev2.pageX-container.offsetLeft, ev2.pageY-container.offsetTop];

    if (container.mode === 1) {
        if (ev2.shiftKey && ev2.ctrlKey) {
            let s = scene.search_nearest_cutter_side([ev2.pageX-container.offsetLeft, ev2.pageY-container.offsetTop]);
            if (s) {
                let tan = (s.p2[1]-s.p1[1])/(s.p2[0]-s.p1[0]);
                p2[1] = (p2[0]-s.p1[0])*tan+s.p1[1];
            }
        } else {
            if (ev2.ctrlKey) {
                p2[1] = scene.p1[1];
            }
            if (ev2.altKey) {
                p2[0] = scene.p1[0];
            }
            if (ev2.shiftKey) {
                let s = scene.search_nearest_cutter_side(scene.p1);
                if (s) {
                    let tan = (s.p2[1]-s.p1[1])/(s.p2[0]-s.p1[0]);
                    p2[1] = (p2[0]-scene.p1[0])*tan+scene.p1[1];
                }
            }
        }
        scene.lines[scene.lines.length-1].set(...(scene.p1), ...p2);
    } else if (container.mode === 2) {
        if (ev2.shiftKey && ev2.ctrlKey) {
            let s = scene.search_nearest_lines_side([ev2.pageX-container.offsetLeft, ev2.pageY-container.offsetTop]);
            if (s) {
                let tan = (s.p2[1]-s.p1[1])/(s.p2[0]-s.p1[0]);
                p2[1] = (p2[0]-s.p1[0])*tan+s.p1[1];
            }
        } else {
            if (ev2.ctrlKey) {
                p2[1] = scene.p1[1];
            }
            if (ev2.altKey) {
                p2[0] = scene.p1[0];
            }
        }
        scene.set_cutter_side(scene.cutter.sides.length-1, scene.p1, p2)
    }
}

function set_container_mode() {
    let radios = [];
    document.getElementsByName("tp").forEach(e => radios.push(e));
    container.mode = radios.filter(e => e.checked).map(e => e.value).map(e => +e)[0];
}

function cut_listener() {
    if (scene.check_cutter() === 1)
        scene.draw_cut();
    else
        alert("Cutter is not convex!");
}

function add_line_listener() {
    let xy = document.getElementById("xy").value;
    if (!checkInput(/\d{1,10} \d{1,10}/, xy)) {return;}

    scene.lines[scene.lines.length-1].set(...(scene.p1), ...xy.split(" ").map(e => +e));
    scene.p1 = xy.split(" ").map(e => +e);

    scene.add_line(scene.p1, scene.p1);

    draw();
}

function set_cutter_listener() {
    let xy = document.getElementById("cxy").value;
    if (!checkInput(/\d{1,10} \d{1,10}/, xy)) {return;}

    scene.set_cutter_side(scene.cutter.sides.length-1, scene.p1, xy.split(" ").map(e => +e));
    scene.p1 = xy.split(" ").map(e => +e);

    scene.add_cutter_side(scene.p1, scene.p1);

    draw();
}

function cm_listener() {
    container.removeEventListener("mousemove", move_listener);
    if (container.mode === 1) {
        scene.lines[scene.lines.length-1].set(...(scene.p1), ...scene.lines[0].p1);
    } else if (container.mode === 2) {
        scene.set_cutter_side(scene.cutter.sides.length-1, scene.p1, scene.cutter.sides[0].p1);
    }
    scene.p1 = undefined;
    delete scene.p1;
    noLoop();
}

function set_radio1() {
    document.getElementById("tp1").checked = true;
    document.getElementById("tp2").checked = false;
}

function set_radio2() {
    document.getElementById("tp1").checked = false;
    document.getElementById("tp2").checked = true;
}
