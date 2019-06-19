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
    constructor(p, wh) {
        this.sides = [];
        this.add_edge([p[0], p[1]], [p[0]+wh[0], p[1]]);
        this.add_edge([p[0]+wh[0], p[1]], [p[0]+wh[0], p[1]+wh[1]]);
        this.add_edge([p[0]+wh[0], p[1]+wh[1]], [p[0], p[1]+wh[1]]);
        this.add_edge([p[0], p[1]+wh[1]], [p[0], p[1]]);
    }

    set_rect(p, wh) {
        this.set_edge(0, [p[0], p[1]], [p[0]+wh[0], p[1]]);
        this.set_edge(1, [p[0]+wh[0], p[1]], [p[0]+wh[0], p[1]+wh[1]]);
        this.set_edge(2, [p[0]+wh[0], p[1]+wh[1]], [p[0], p[1]+wh[1]]);
        this.set_edge(3, [p[0], p[1]+wh[1]], [p[0], p[1]]);
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

    clear_cutter() {
        noStroke();
        fill(255, 255, 255);
        rect(...(this.sides[0].p1), this.sides[0].p2[0]-this.sides[0].p1[0], this.sides[3].p2[1]-this.sides[3].p1[1]);
        noFill();
    }

    reset() {
        this.set_rect([0, 0], [0, 0]);
    }
}


class Scene {
    constructor() {
        this.lines = [];
        this.l_color = [0, 0, 0];
        this.c_color = [255, 0, 0];
        this.i_color = [200, 200, 200];
        this.cutter = new Cutter([0, 0], [0, 0]);
    }

    set_color(l_c, c_c, i_c) {
        this.l_color = convertColor(document.getElementById(l_c).value);
        this.c_color = convertColor(document.getElementById(c_c).value);
        this.i_color = convertColor(document.getElementById(i_c).value);
    }

    add_line(p1, p2) {
        this.lines.push(new Line(...p1, ...p2));
    }

    set_cutter(p, wh) {
        this.cutter.set_rect(p, wh);
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

    draw_cut() {
        stroke(this.i_color);
        for (let l = this.lines[0], i = 0; i < this.lines.length; i++, l = this.lines[i]) {
            l.draw();
        }
        console.log(this.cutter.sides[0]);

        let top = (this.cutter.sides[0].p1[1] < this.cutter.sides[2].p1[1]) ? this.cutter.sides[0] : this.cutter.sides[2],
            bottom = (this.cutter.sides[0].p1[1] > this.cutter.sides[2].p1[1]) ? this.cutter.sides[0] : this.cutter.sides[2],
            left = (this.cutter.sides[3].p1[0] > this.cutter.sides[1].p1[0]) ? this.cutter.sides[1] : this.cutter.sides[3],
            right = (this.cutter.sides[3].p1[0] < this.cutter.sides[1].p1[0]) ? this.cutter.sides[1] : this.cutter.sides[3];

        stroke(this.l_color);
        for (let l = this.lines[0], k = 0; k < this.lines.length; k++, l = this.lines[k]) {
            let T1 = 0, T2 = 0;

            if (l.p1[0] < left.p1[0]) {
                T1 += 1;
            } else if (l.p1[0] > right.p1[0]) {
                T1 += 2;
            }
            if (l.p1[1] > bottom.p1[1]) {
                T1 += 4;
            } else if (l.p1[1] < top.p1[1]) {
                T1 += 8;
            }

            if (l.p2[0] < left.p1[0]) {
                T2 += 1;
            } else if (l.p2[0] > right.p1[0]) {
                T2 += 2;
            }
            if (l.p2[1] > bottom.p1[1]) {
                T2 += 4;
            } else if (l.p2[1] < top.p1[1]) {
                T2 += 8;
            }

            let S1 = T1, S2 = T2,
                Fl = 1,
                m = Infinity,
                R1, R2, i = 1;

            if (S1 === 0 && S2 === 0) {
                R1 = l.p1;
                R2 = l.p2;
                i = 3;
            } else {
                let PL = T1 & T2, Q,
                    Xl = left.p1[0], Xr = right.p1[0],
                    Yb = bottom.p1[1], Ya = top.p1[1];

                let check_intercept = () => {
                    let R;
                    if (l.p1[0] !== l.p2[0]) {
                        if (Q[0] <= Xl) {
                            let Yp = Math.round(m*(Xl-Q[0])+Q[1]);
                            if (Yp <= Yb && Yp >= Ya) {R = []; R[0] = Xl; R[1] = Yp; i++;}
                        } else if (Q[0] >= Xr) {
                            let Yp = Math.round(m*(Xr-Q[0])+Q[1]);
                            if (Yp <= Yb && Yp >= Ya) {R = []; R[0] = Xr; R[1] = Yp; i++;}
                        }
                    }
                    if (l.p1[1] !== l.p2[0]) {
                        if (Q[1] <= Ya) {
                            let Xp = Math.round((Ya-Q[1])/m+Q[0]);
                            if (Xp >= Xl && Xp <= Xr) {R = []; R[0] = Xp; R[1] = Ya; i++;}
                        } else if (Q[1] >= Yb) {
                            let Xp = Math.round((Yb-Q[1])/m+Q[0]);
                            if (Xp >= Xl && Xp <= Xr) {R = []; R[0] = Xp; R[1] = Yb; i++;}
                        }
                    }
                    return R;
                };

                if (PL !== 0) {
                    Fl = -1;
                    continue;
                }


                m = (l.p2[1] - l.p1[1])/(l.p2[0] - l.p1[0]);
                if (S1 === 0) {
                    R1 = l.p1;
                    Q = l.p2;
                    i = 2;
                    R2 = check_intercept();
                } else if (S2 === 0) {
                    R1 = l.p2;
                    Q = l.p1;
                    i = 2;
                    R2 = check_intercept();
                } else {
                    Q = l.p1;
                    R1 = check_intercept();
                    Q = l.p2;
                    R2 = check_intercept();
                }
            }

            if (i > 2 && Fl === 1) {
                line(...R1, ...R2);
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

    if (container.mode === 1) {
        scene.p1 = [ev.pageX-container.offsetLeft, ev.pageY-container.offsetTop];

        scene.add_line(scene.p1, scene.p1);

        container.addEventListener("mousemove", move_listener);
        container.addEventListener("mouseup", up_listener);
    } else if (container.mode === 2) {
        scene.p1 = [ev.pageX-container.offsetLeft, ev.pageY-container.offsetTop];

        scene.set_cutter(scene.p1, [0, 0]);

        container.addEventListener("mousemove", move_listener);
        container.addEventListener("mouseup", up_listener);
    }
}

function move_listener() {
    let ev2 = window.event;
    let p2 = [ev2.pageX-container.offsetLeft, ev2.pageY-container.offsetTop];

    if (ev2.ctrlKey) {
        p2[1] = scene.p1[1];
    }
    if (ev2.altKey) {
        p2[0] = scene.p1[0];
    }

    if (container.mode === 1) {
        scene.lines[scene.lines.length-1].set(...(scene.p1), ...p2);
    } else if (container.mode === 2) {
        let w = p2[0]-scene.p1[0], h = p2[1]-scene.p1[1];
        scene.set_cutter(scene.p1, [w, h])
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
    scene.cutter.clear_cutter();
    scene.draw_cut();
}

function add_line_listener() {
    let xy = document.getElementById("xy").value;
    if (!checkInput(/\d{1,10} \d{1,10}, \d{1,10} \d{1,10}/, xy)) {return;}

    scene.add_line(...(xy.split(", ").map(e => e.split(" ").map(e => parseInt(e)))));
    draw();
}

function set_cutter_listener() {
    let xy = document.getElementById("cxy").value;
    if (!checkInput(/\d{1,10} \d{1,10}, \d{1,10} \d{1,10}/, xy)) {return;}

    scene.cutter.set_rect(...(xy.split(", ").map(e => e.split(" ").map(e => parseInt(e)))));
    draw();
}
