let     rwidth = 40,
        rheight = 40,
        container = document.getElementById('canvas');

const   PI = Math.PI;


class Figure {
    constructor() {
        this.a = 2;
        this.b = 3;
        this.queue = [];
        this.rectx1 = -14;
        this.recty1 = 8;
        this.rectx2 = 14;
        this.recty2 = 8;
        this.rectx3 = 14;
        this.recty3 = -8;
        this.rectx4 = -14;
        this.recty4 = -8;
    }

    _x(t) {
        return (this.a+this.b)*Math.cos(t)-this.a*Math.cos((this.a+this.b)*t/this.a);
    }

    _y(t) {
        return (this.a+this.b)*Math.sin(t)-this.a*Math.sin((this.a+this.b)*t/this.a);
    }

    _movex(x, dx) {
        return x+dx;
    }

    _movey(y, dy) {
        return y+dy;
    }

    _scalex(x, kx, scx) {
        return kx*(x-scx)+scx;
    }

    _scaley(y, ky, scy) {
        return ky*(y-scy)+scy;
    }

    _rotatex(x, y, qe) {
        return (qe[2]+(x-qe[2])*Math.cos(qe[1])+(y-qe[3])*Math.sin(qe[1]));
    }

    _rotatey(y, x, qe) {
        return (qe[3]+(y-qe[3])*Math.cos(qe[1])-(x-qe[2])*Math.sin(qe[1]));
    }

    xy(t) {
        return this.queue.reduce((xy, e) => {
            switch (e[0]) {
                case '1': return [this._movex(xy[0], e[1]), this._movey(xy[1], e[2])];
                case '2': return [this._scalex(xy[0], e[1], e[3]), this._scaley(xy[1], e[2], e[4])];
                case '3': return [this._rotatex(xy[0], xy[1], e), this._rotatey(xy[1], xy[0], e)];
            }
        }, [this._x(t), this._y(t)]);
    }

    draw() {
        stroke(255, 0, 0); fill(255, 255, 0);
        let rectxy1 = this.queue.reduce((xy, e) => {
                switch (e[0]) {
                    case '1': return [this._movex(xy[0], e[1]), this._movey(xy[1], e[2])];
                    case '2': return [this._scalex(xy[0], e[1], e[3]), this._scaley(xy[1], e[2], e[4])];
                    case '3': return [this._rotatex(xy[0], xy[1], e), this._rotatey(xy[1], xy[0], e)];
                }
            }, [this.rectx1, this.recty1]),
            rectxy2 = this.queue.reduce((xy, e) => {
                switch (e[0]) {
                    case '1': return [this._movex(xy[0], e[1]), this._movey(xy[1], e[2])];
                    case '2': return [this._scalex(xy[0], e[1], e[3]), this._scaley(xy[1], e[2], e[4])];
                    case '3': return [this._rotatex(xy[0], xy[1], e), this._rotatey(xy[1], xy[0], e)];
                }
            }, [this.rectx2, this.recty2]),
            rectxy3 = this.queue.reduce((xy, e) => {
                switch (e[0]) {
                    case '1': return [this._movex(xy[0], e[1]), this._movey(xy[1], e[2])];
                    case '2': return [this._scalex(xy[0], e[1], e[3]), this._scaley(xy[1], e[2], e[4])];
                    case '3': return [this._rotatex(xy[0], xy[1], e), this._rotatey(xy[1], xy[0], e)];
                }
            }, [this.rectx3, this.recty3]),
            rectxy4 = this.queue.reduce((xy, e) => {
                switch (e[0]) {
                    case '1': return [this._movex(xy[0], e[1]), this._movey(xy[1], e[2])];
                    case '2': return [this._scalex(xy[0], e[1], e[3]), this._scaley(xy[1], e[2], e[4])];
                    case '3': return [this._rotatex(xy[0], xy[1], e), this._rotatey(xy[1], xy[0], e)];
                }
            }, [this.rectx4, this.recty4]);

        beginShape();
        vertex(sx(rectxy1[0]), sy(rectxy1[1]));
        vertex(sx(rectxy2[0]), sy(rectxy2[1]));
        vertex(sx(rectxy3[0]), sy(rectxy3[1]));
        vertex(sx(rectxy4[0]), sy(rectxy4[1]));
        endShape(CLOSE);

        fill(255, 255, 255);
        beginShape();
        for (let t = 0; t < 2 * this.a * PI; t += 1 / (7 * container.clientWidth / rwidth)) {
            let p = this.xy(t);
            vertex(sx(p[0]), sy(p[1]));
        }
        endShape(CLOSE);
    }

    move(idm) {
        if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, document.getElementById(idm).value)) {return;}

        let dx = parseFloat(document.getElementById(idm).value.split(" ")[0]),
            dy = parseFloat(document.getElementById(idm).value.split(" ")[1]),
            span = document.createElement("span");
        this.queue.push(['1', dx, dy]);
        span.setAttribute('class', 'd-block w-100');
        document.getElementById('queue').appendChild(span).innerText = `Move: dx=${dx}, dy=${dy}`;
    }

    scale(idk, idsc) {
        if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, document.getElementById(idk).value)) {return;}
        if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, document.getElementById(idsc).value)) {return;}

        let kx = parseFloat(document.getElementById(idk).value.split(" ")[0]),
            ky = parseFloat(document.getElementById(idk).value.split(" ")[1]),
            scx = parseFloat(document.getElementById(idsc).value.split(" ")[0]),
            scy = parseFloat(document.getElementById(idsc).value.split(" ")[1]),
            span = document.createElement("span");
        this.queue.push(['2', kx, ky, scx, scy]);
        span.setAttribute('class', 'd-block w-100');
        document.getElementById('queue').appendChild(span).innerText = `Scale: kx=${kx}, ky=${ky}, Sx=${scx}, Sy=${scy}`;
    }

    rotate(ida, idrc) {
        if (!checkInput(/-?\d+/, document.getElementById(ida).value)) {return;}
        if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, document.getElementById(idrc).value)) {return;}

        let a = parseFloat(document.getElementById(ida).value),
            rx = parseFloat(document.getElementById(idrc).value.split(" ")[0]),
            ry = parseFloat(document.getElementById(idrc).value.split(" ")[1]),
            span = document.createElement("span");
        this.queue.push(['3', -(a/180*PI), rx, ry]);
        span.setAttribute('class', 'd-block w-100');
        document.getElementById('queue').appendChild(span).innerText = `Rotate: a=${a}, Rx=${rx}, Ry=${ry}`;
    }
}


let fig = new Figure();


function setup() {
    let canvas = createCanvas(container.clientWidth, container.clientWidth);

    canvas.parent('canvas');
    canvas.class("border no-gutters");
    canvas.id("canvasPage");

    document.getElementById('dxy').value = [0, 0].join(" ");
    document.getElementById('kxy').value = [1, 1].join(" ");
    document.getElementById('sc').value = [0, 0].join(" ");
    document.getElementById('a').value = "0";
    document.getElementById('rc').value = [0, 0].join(" ");

    window.onresize = resize.bind(this);
}

function draw() {
    noStroke();
    fill(255, 255, 255);
    rect(0, 0, scalex(rwidth), scaley(rheight));
    noFill();
    stroke(0 ,0 ,0);
    // line(sx(-rwidth/2), sy(0), sx(rwidth/2), sy(0));
    // line(sx(0), sy(rheight/2), sx(0), sy(-rheight/2));
    fig.draw();
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

function sx(xc) {
    return Math.floor(scalex(xc + rwidth/2));
}

function sy(yc) {
    return Math.floor(scaley(rheight/2 - yc));
}

function checkInput(reg, str) {
    if (str.match(reg) != str) {
        alert("Incorrect input!");
        return false;
    }
    return true;
}
