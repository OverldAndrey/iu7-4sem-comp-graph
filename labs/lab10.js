let     rwidth = 16,
        rheight = 16,
        container = document.getElementById('canvas');


class Surface {
    constructor(expr, e_text) {
        this.expr = expr;
        this.e_text = e_text;
        this.dr_step = 0.01;
        this.ax = 10;
        this.ay = -10;
        this.az = 0;
        this.color = "#FF0000";
    }

    f(x, z) {
        return eval(this.expr);
    }

    // calc_line_z(x1, x2, z) {
    //     let dx = this.dr_step,
    //         x = x1,
    //         res = [];
    //
    //     for (; x <= x2+dx; x += dx) {
    //         res.push(this.f(x, z));
    //     }
    //
    //     return res;
    // }

    // _check_collide(c, t, s, p) {
    //     let x1 = c[0], y1 = c[1],
    //         x2 = t[0], y2 = t[1],
    //         x3 = s[0], y3 = s[1],
    //         x4 = p[0], y4 = p[1],
    //         z = ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    //     let x = ((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-x4*y3))/z,
    //         y = ((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-x4*y3))/z;
    //
    //     if (x1 === x2) {
    //         x = x1;
    //         y = -(y4-y3)/(x4-x3)*(x4-x)+y4;
    //     }
    //     if (x3 === x4) {
    //         x = x3;
    //         y = -(y2-y1)/(x2-x1)*(x2-x)+y2;
    //     }
    //
    //     return (z === 0) ? s : [x, y];
    // }

    _rotateX(x, y, z, a) {
        a = a * Math.PI / 180;
        let buf = y;
        y = Math.cos(a) * y - Math.sin(a) * z;
        z = Math.cos(a) * z + Math.sin(a) * buf;
        return [x, y, z];
    }

    _rotateY(x, y, z, a) {
        a = a * Math.PI / 180;
        let buf = x;
        x = Math.cos(a) * x - Math.sin(a) * z;
        z = Math.cos(a) * z + Math.sin(a) * buf;
        return [x, y, z];
    }

    _rotateZ(x, y, z, a) {
        a = a * Math.PI / 180;
        let buf = x;
        x = Math.cos(a) * x - Math.sin(a) * y;
        y = Math.cos(a) * y + Math.sin(a) * buf;
        return [x, y, z];
    }

    _transform(x, y, z, ax, ay, az) {
        let res = [x, y, z];
        res = this._rotateX(...res, ax);
        res = this._rotateY(...res, ay);
        res = this._rotateZ(...res, az);

        return {"x":_x(res[0]), "y":_y(res[1]), "z":res[2]};
    }

    // draw_surf(x1, x2, dx, z1, z2, dz) {
    //     this.dr_step = dx;
    //
    //     let high_horiz = [],
    //         low_horiz = [],
    //         x_arr = [];
    //
    //     for (let x = x1; x <= x2; x += this.dr_step) {
    //         let {"x":xt, "y":yt1} = this._transform(x, f(x, z2), z2, this.ax, this.ay, this.az);
    //         let {"y":yt2} = this._transform(x, f(x, z2), z2, this.ax, this.ay, this.az);
    //         high_horiz.push(yt1);
    //         low_horiz.push(yt2);
    //         x_arr.push(xt);
    //     }
    //
    //     for (let i = 1; i < high_horiz.length; i++) {
    //         line(_x(x_arr[i-1]), _y(high_horiz[i-1]), _x(x_arr[i]), _y(high_horiz[i]));
    //     }
    //
    //     for (let z = z2-dz; z >= z1; z -= dz) {
    //         let {"x":x_prev, "y":y_prev} = this._transform(x1, this.f(x1, z), z, this.ax, this.ay, this.az);
    //
    //         for (let i = 1; i < high_horiz.length; i++) {
    //             let x = x1+i*this.dr_step;
    //             let {"x":x_cur, "y":y_cur} = this._transform(x, this.f(x, z), z, this.ax, this.ay, this.az);
    //
    //             if (y_cur >= high_horiz[i]) {
    //                 high_horiz[i] = y_cur;
    //             } else if (y_cur <= low_horiz[i]) {
    //                 low_horiz[i] = y_cur;
    //             }
    //
    //             x_prev = x_cur;
    //             y_prev = y_cur;
    //         }
    //     }
    // }

    lineHor(x1, y1, x2, y2, top, bottom) {
        let x = x1,
            y = y1,
            dx = x2 - x1,
            dy = y2 - y1,
            sx = Math.sign(dx),
            sy = Math.sign(dy);
        dx = Math.abs(dx);
        dy = Math.abs(dy);

        if (dx === 0 && dy === 0 && 0 <= x && x < container.clientWidth) {
            if (y >= top[x]) {
                top[x] = y;
                point(x, y);
            }

            if (y <= bottom[x]) {
                bottom[x] = y;
                point(x, y);
            }

            return {"top":top, "bottom":bottom};
        }

        let change = false;
        if (dy > dx) {
            let t = dx;
            dx = dy;
            dy = t;
            change = true;
        }

        let y_max_cur = top[x],
            y_min_cur = bottom[x],
            e = 2 * dy - dx;

        let i = 1;
        while (i <= dx) {
            if (0 <= x && x < container.clientWidth) {
                if (y >= top[x]) {
                    if (y >= y_max_cur) {
                        y_max_cur = y;
                        point(x, y);
                    }
                }

                if (y <= bottom[x]) {
                    if (y <= y_min_cur) {
                        y_min_cur = y;
                        point(x, y);
                    }
                }
            }


            if (e >= 0) {
                if (change) {
                    top[x] = y_max_cur;
                    bottom[x] = y_min_cur;

                    x += sx;

                    y_max_cur = top[x];
                    y_min_cur = bottom[x];
                } else {
                    y += sy;
                }

                e -= 2 * dx;
            }
            if (e < 0) {
                if (!change) {
                    top[x] = y_max_cur;
                    bottom[x] = y_min_cur;

                    x += sx;

                    y_max_cur = top[x];
                    y_min_cur = bottom[x];
                } else {
                    y += sy;
                }

                e += 2 * dy;
            }

            i += 1;
        }

        return {"top":top, "bottom":bottom};
    }

    draw_surf(x1, x2, dx, z1, z2, dz) {
        this.dr_step = dx;
        stroke(this.color);

        let xl = -1,
            yl = -1;

        let top = [], bottom = [];

        for (let i = 1; i < container.clientWidth+1; i++) {
            top[i] = 0;
            bottom[i] = container.clientWidth;
        }

        for (let z = z2; z >= z1; z -= dz) {
            let {"x":xp, "y":yp} = this._transform(x1, this.f(x1, z), z, this.ax, this.ay, this.az);

            if (xl !== -1) {
                let r = this.lineHor(xl, yl, xp, yp, top, bottom);
                top = r["top"];
                bottom = r["bottom"];
            }
            xl = xp;
            yl = yp;

            for (let x = x1; x <= x2; x += this.dr_step) {
                let {"x":x_cur, "y":y_cur} = this._transform(x, this.f(x, z), z, this.ax, this.ay, this.az);

                let r = this.lineHor(xp, yp, x_cur, y_cur, top, bottom);
                top = r["top"];
                bottom = r["bottom"];
                xp = x_cur;
                yp = y_cur;
            }

            if (z !== z1) {
                let {"x":xr, "y":yr} = this._transform(x2, this.f(x2, z - dz), z-dz, this.ax, this.ay, this.az);
                let r = this.lineHor(xp, yp, xr, yr, top, bottom);
                top = r["top"];
                bottom = r["bottom"];
            }
        }
    }
}


let s1 = new Surface("Math.exp(Math.sin(Math.sqrt(x**2 + z**2)))", "exp(sin(sqrt(x**2 + z**2)))");
let s2 = new Surface("x**2+z**2", "x**2 + z**2");
let s3 = new Surface("Math.cos(x)*Math.sin(z)", "cos(x) * sin(z)");
let s4 = new Surface("1/(1+x**2)+1/(1+z**2)", "1/(1+x**2) + 1/(1+z**2)");
let s5 = new Surface("Math.sin(x**2+z**2)/5", "sin(x**2 + z**2)/5");

container.s = s1;
document.getElementById("axc").innerText = container.s.ax;
document.getElementById("ayc").innerText = container.s.ay;
document.getElementById("azc").innerText = container.s.az;


function setup() {
    let canvas = createCanvas(container.clientWidth, container.clientWidth);

    canvas.parent('canvas');
    canvas.class("border no-gutters");
    canvas.id("canvasPage");

    textSize(14);

    window.onresize = resize.bind(this);
    noLoop();
}

function draw() {
    noStroke();
    fill(255, 255, 255);
    rect(0, 0, scalex(rwidth), scaley(rheight));
    noFill();
    stroke(0 ,0 ,0);
    line(_x(-rwidth/2), _y(0), _x(rwidth/2), _y(0));
    line(_x(0), _y(rheight/2), _x(0), _y(-rheight/2));
    stroke(255, 0, 0);
    noFill();

    container.s.draw_surf(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
}


function resize() {
    canvas.style.width = container.clientWidth + "px";
    canvas.style.height = container.clientWidth + "px";
}

function scalex(cx) {
    return  cx / rwidth * width;
}

function scaley(cy) {
    return  cy / rheight * height;
}

function _x(xc) {
    return Math.round(scalex(xc + rwidth/2));
}

function _y(yc) {
    return Math.round(scaley(rheight/2 - yc));
}

function updateSize(str) {
    if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, str)) return null;

    rwidth = max(rwidth, Math.floor(Math.abs(str.split(' ')[0]*2)) + 1);
    rheight = max(max(rheight, Math.floor(Math.abs(str.split(' ')[1]*2)) + 1), rwidth);
    rwidth = max(rwidth, rheight);

    return str;
}

function checkInput(reg, str) {
    if (str.match(reg) != str) {
        alert("Incorrect input!");
        return false;
    }
    return true;
}

function draw_listener() {
    if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, document.getElementById("xr").value)) return;
    if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, document.getElementById("zr").value)) return;
    if (!checkInput(/-?\d{1,10}\.?\d{0,12}/, document.getElementById("xs").value)) return;
    if (!checkInput(/-?\d{1,10}\.?\d{0,12}/, document.getElementById("zs").value)) return;

    let {"0":x1, "1":x2} = document.getElementById("xr").value.split(" ").map(e => +e),
        xs = +document.getElementById("xs").value,
        {"0":z1, "1":z2} = document.getElementById("zr").value.split(" ").map(e => +e),
        zs = +document.getElementById("zs").value;

    draw(x1, x2, xs, z1, z2, zs);
}

function rotate_listener() {
    if (!checkInput(/-?\d{1,10}\.?\d{0,12}/, document.getElementById("ax").value)) return;
    if (!checkInput(/-?\d{1,10}\.?\d{0,12}/, document.getElementById("ay").value)) return;
    if (!checkInput(/-?\d{1,10}\.?\d{0,12}/, document.getElementById("az").value)) return;

    container.s.ax += +document.getElementById("ax").value;
    container.s.ay += +document.getElementById("ay").value;
    container.s.az += +document.getElementById("az").value;
    if (container.s.az > 30) {container.s.az = 30;}
    document.getElementById("axc").innerText = container.s.ax;
    document.getElementById("ayc").innerText = container.s.ay;
    document.getElementById("azc").innerText = container.s.az;
}

function color_listener() {
    container.s.color = document.getElementById("s_color").value;
}

function set_container_mode() {
    let radios = [];
    document.getElementsByName("surface").forEach(e => radios.push(e));
    container.mode = radios.filter(e => e.checked).map(e => e.value)[0];

    switch (container.mode) {
        case "s1": container.s = s1; break;
        case "s2": container.s = s2; break;
        case "s3": container.s = s3; break;
        case "s4": container.s = s4; break;
        case "s5": container.s = s5; break;
        default: container.s = s1; break;
    }

    document.getElementById("c_surf").innerText = container.s.e_text;
    document.getElementById("axc").innerText = container.s.ax;
    document.getElementById("ayc").innerText = container.s.ay;
    document.getElementById("azc").innerText = container.s.az;
}

function set_radio1() {
    document.getElementById("s1").checked = true;
    document.getElementById("s2").checked = false;
    document.getElementById("s3").checked = false;
    document.getElementById("s4").checked = false;
    document.getElementById("s5").checked = false;
}

function set_radio2() {
    document.getElementById("s1").checked = false;
    document.getElementById("s2").checked = true;
    document.getElementById("s3").checked = false;
    document.getElementById("s4").checked = false;
    document.getElementById("s5").checked = false;
}

function set_radio3() {
    document.getElementById("s1").checked = false;
    document.getElementById("s2").checked = false;
    document.getElementById("s3").checked = true;
    document.getElementById("s4").checked = false;
    document.getElementById("s5").checked = false;
}

function set_radio4() {
    document.getElementById("s1").checked = false;
    document.getElementById("s2").checked = false;
    document.getElementById("s3").checked = false;
    document.getElementById("s4").checked = true;
    document.getElementById("s5").checked = false;
}

function set_radio5() {
    document.getElementById("s1").checked = false;
    document.getElementById("s2").checked = false;
    document.getElementById("s3").checked = false;
    document.getElementById("s4").checked = false;
    document.getElementById("s5").checked = true;
}
