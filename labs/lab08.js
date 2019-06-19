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
            // let t1 = Math.sqrt((p[0]-s.p1[0])**2+(p[1]-s.p1[1])**2),
            //     t2 = Math.sqrt((p[0]-s.p2[0])**2+(p[1]-s.p2[1])**2);
            //
            // if (t1 < l1 && t2 < l2) {
            //     l1 = t1;
            //     l2 = t2;
            //     res = s;
            // }
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

    draw_cut() {
        stroke(this.i_color);
        for (let l = this.lines[0], i = 0; i < this.lines.length; i++, l = this.lines[i]) {
            l.draw();
        }
        stroke(this.c_color);
        this.cutter.draw();

        stroke(this.l_color);

        for (let l = this.lines[0], i = 0; i < this.lines.length; i++, l = this.lines[i]) {
            let p1 = l.p1,
                p2 = l.p2,
                tb = 0,
                te = 1,
                D = [p2[0]-p1[0], p2[1]-p1[1]],
                fl = true;

            let scal_mul = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1],
                p_cut = (p1, p2, t) => [(p2[0]-p1[0])*t+p1[0], (p2[1]-p1[1])*t+p1[1]];

            for (let s = this.cutter.sides[0], j = 0; j < this.cutter.sides.length; j++, s = this.cutter.sides[j]) {
                let ax = s.p2[0] - s.p1[0],
                    ay = s.p2[1] - s.p1[1],
                    ni = (ax === 0) ? [1, 0] : [-ay / ax, 1],
                    wi = [p1[0]-s.p1[0], p1[1]-s.p1[1]],
                    jn = (j+1 === this.cutter.sides.length) ? 0 : j+1;

                if (scal_mul(ni, [this.cutter.sides[jn].p2[0]-this.cutter.sides[jn].p1[0], this.cutter.sides[jn].p2[1]-this.cutter.sides[jn].p1[1]]) < 0) {
                    ni[0] = -ni[0];
                    ni[1] = -ni[1];
                }

                let ds = scal_mul(ni, D),
                    ws = scal_mul(wi, ni);

                if (ds !== 0) {
                    let t = -(ws/ds);

                    if (ds > 0) {
                        if (t <= 1) {
                            tb = Math.max(tb, t);
                        } else {
                            fl = false;
                            break;
                        }
                    } else {
                        if (t >= 0) {
                            te = Math.min(te, t);
                        } else {
                            fl = false;
                            break;
                        }
                    }
                } else {
                    if (ws < 0) {
                        fl = false;
                        break;
                    }
                }
            }

            if (fl) {
                if (tb < te) {
                    line(...p_cut(p1, p2, tb), ...p_cut(p1, p2, te));
                }
            }
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
        scene.p1 = [ev.pageX-container.offsetLeft, ev.pageY-container.offsetTop];

        scene.add_line(scene.p1, scene.p1);

        container.addEventListener("mousemove", move_listener);
        container.addEventListener("mouseup", up_listener);
    } else if (container.mode === 2) {
        if (!scene.p1)
            scene.cutter.reset();

        scene.p1 = [ev.pageX-container.offsetLeft, ev.pageY-container.offsetTop];

        scene.add_cutter_side(scene.p1, scene.p1);

        container.addEventListener("mousemove", move_listener);
    }
}

function move_listener() {
    let ev2 = window.event;
    let p2 = [ev2.pageX-container.offsetLeft, ev2.pageY-container.offsetTop];

    if (container.mode === 1) {
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
        scene.lines[scene.lines.length-1].set(...(scene.p1), ...p2);
    } else if (container.mode === 2) {
        scene.set_cutter_side(scene.cutter.sides.length-1, scene.p1, p2)
    }
}

function up_listener() {
    container.removeEventListener("mousemove", move_listener);
    container.removeEventListener("mouseup", up_listener);
    scene.p1 = undefined;
    delete scene.p1;
    noLoop();
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
    if (!checkInput(/\d{1,10} \d{1,10}, \d{1,10} \d{1,10}/, xy)) {return;}

    scene.add_line(...(xy.split(", ").map(e => e.split(" ").map(e => parseInt(e)))));
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
    scene.set_cutter_side(scene.cutter.sides.length-1, scene.p1, scene.cutter.sides[0].p1);
    scene.p1 = undefined;
    delete scene.p1;
    noLoop();
}
