const   container = document.getElementById('canvas');

let     clr = "#00FF80";


function circLib(x1, y1, r) {
    ellipse(scalex(x1), scaley(y1), r*2, r*2);
}

function circCan(x1, y1, r) {
    let y = function (x) {
        return Math.sqrt(r**2-x**2);
    };


    for (let x = 0; x <= Math.ceil(r*Math.cos(PI/4)); x++) {
        let yx = y(x);
        point(scalex(x+x1), scaley(yx+y1));
        point(scalex(-x+x1), scaley(yx+y1));
        point(scalex(x+x1), scaley(-yx+y1));
        point(scalex(-x+x1), scaley(-yx+y1));
        point(scalex(yx+x1), scaley(x+y1));
        point(scalex(-yx+x1), scaley(x+y1));
        point(scalex(yx+x1), scaley(-x+y1));
        point(scalex(-yx+x1), scaley(-x+y1));
    }
}

function circPar(x1, y1, r) {
    let x = function (t) {
        return r*Math.cos(t);
    },
        y = function (t) {
        return r*Math.sin(t);
    };

    for (let t = 0; t <= PI/4; t += 1/r) {
        let xt = x(t),
            yt = y(t);
        point(scalex(xt+x1), scaley(yt+y1));
        point(scalex(-xt+x1), scaley(yt+y1));
        point(scalex(xt+x1), scaley(-yt+y1));
        point(scalex(-xt+x1), scaley(-yt+y1));
        point(scalex(yt+x1), scaley(xt+y1));
        point(scalex(-yt+x1), scaley(xt+y1));
        point(scalex(yt+x1), scaley(-xt+y1));
        point(scalex(-yt+x1), scaley(-xt+y1));
    }
}

function circBrz(x1, y1, r) {
    let x = 0,
        y = r,
        d = (x+1)**2+(y-1)**2-r**2,
        yf = 0,
        d1,d2;

    point(scalex(x+x1), scaley(y+y1));
    point(scalex(-x+x1), scaley(y+y1));
    point(scalex(x+x1), scaley(-y+y1));
    point(scalex(-x+x1), scaley(-y+y1));
    while (y > yf) {
        if (d < 0) {
            d1 = 2*(d + y) - 1;
            if (d1 < 0) {
                x = x + 1;
                d = d + 2 * x + 1;
            } else {
                x = x + 1;
                y = y - 1;
                d = d + 2 * (x - y + 1);
            }
        } else if (d === 0) {
            x = x + 1;
            y = y - 1;
            d = d + 2 * (x - y + 1);
        } else {
            d2 = 2 * (d - x) - 1;
            if (d2 < 0) {
                x = x + 1;
                y = y - 1;
                d = d + 2 * (x - y + 1);
            } else {
                y = y - 1;
                d = d - 2 * y + 1;
            }
        }
        point(scalex(x+x1), scaley(y+y1));
        point(scalex(-x+x1), scaley(y+y1));
        point(scalex(x+x1), scaley(-y+y1));
        point(scalex(-x+x1), scaley(-y+y1));
    }
}

function circMPt(x1, y1, r) {
    let r2 = r**2,
        r2b = r2 * 2,
        x = 0,
        y = r,
        f = r2 - r2*r + r2/4,
        ym = r2/Math.sqrt(2*r2);

    point(scalex(x+x1), scaley(y+y1));
    point(scalex(-x+x1), scaley(y+y1));
    point(scalex(x+x1), scaley(-y+y1));
    point(scalex(-x+x1), scaley(-y+y1));
    while (y >= ym) {
        if (f < 0) {
            x = x + 1;
            f = f + r2b * x + r2;
        } else {
            x = x + 1;
            y = y - 1;
            f = f + r2b * x + r2 - r2b * y;
        }
        point(scalex(x+x1), scaley(y+y1));
        point(scalex(-x+x1), scaley(y+y1));
        point(scalex(x+x1), scaley(-y+y1));
        point(scalex(-x+x1), scaley(-y+y1));
    }
    f = f + -r2 * y - r2 * x;
    while (y >= 0) {
        if (f <= 0) {
            x = x + 1;
            y = y - 1;
            f = f - r2b * y + r2 + r2b * x;
        } else {
            y = y - 1;
            f = f - r2b * y + r2;
        }
        point(scalex(x+x1), scaley(y+y1));
        point(scalex(-x+x1), scaley(y+y1));
        point(scalex(x+x1), scaley(-y+y1));
        point(scalex(-x+x1), scaley(-y+y1));
    }
}


function drawCircle(cent, rd) {
    if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, cent) || !checkInput(/\d+/, rd)) {return;}

    let method = '1';
    document.getElementsByName('mtd').forEach(e => {if (e.checked) method = e.value});
    clr = document.getElementById('color').value;
    clr = clr.substring(1).split('').reduce((res, e, i) => {if (i % 2 === 0) {res.push(e)} else {res[res.length-1]+=e} return res;}, []).map(e => parseInt(e, 16));

    stroke(...clr);

    if (rd === "0")
    {point(...(cent.split(' ').map((e, i) => i ? scaley(parseFloat(e)) : scalex(parseFloat(e))))); return;}

    switch (method) {
        case '1': circLib(...(cent+' '+rd).split(' ').map(e => parseFloat(e))); break;
        case '2': circCan(...(cent+' '+rd).split(' ').map(e => parseFloat(e))); break;
        case '3': circPar(...(cent+' '+rd).split(' ').map(e => parseFloat(e))); break;
        case '4': circBrz(...(cent+' '+rd).split(' ').map(e => parseFloat(e))); break;
        case '5': circMPt(...(cent+' '+rd).split(' ').map(e => parseFloat(e))); break;
    }
}

function drawTestCircles(rd0, drd, n) {
    if (!checkInput(/\d+/, rd0) || !checkInput(/\d+/, drd) || !checkInput(/\d+/, n)) {return;}

    for (let i = 0; i < parseInt(n); i++) {
        drawCircle('0 0', (parseInt(rd0)+parseInt(drd)*i).toString());
    }
}


function ellpLib(x1, y1, w, h) {
    ellipse(scalex(x1), scaley(y1), w*2, h*2);
}

function ellpCan(x1, y1, a, b) {
    let y = function (x) {
        return Math.sqrt(a**2*b**2-b**2*x**2)/a;
    };
    let x = function (y) {
        return Math.sqrt(a**2*b**2-a**2*y**2)/b;
    };
    let xf = a**2/Math.sqrt(a**2+b**2),
        yf = b**2/Math.sqrt(a**2+b**2);


    for (let x = 0; x <= xf; x++) {
        let yx = y(x);
        point(scalex(x+x1), scaley(yx+y1));
        point(scalex(-x+x1), scaley(yx+y1));
        point(scalex(x+x1), scaley(-yx+y1));
        point(scalex(-x+x1), scaley(-yx+y1));
    }
    for (let y = yf; y >= 0; y--) {
        let xy = x(y);
        point(scalex(xy+x1), scaley(y+y1));
        point(scalex(xy+x1), scaley(-y+y1));
        point(scalex(-xy+x1), scaley(y+y1));
        point(scalex(-xy+x1), scaley(-y+y1));
    }
}

function ellpPar(x1, y1, w, h) {
    let x = function (t) {
            return w*Math.cos(t);
        },
        y = function (t) {
            return h*Math.sin(t);
        };

    for (let t = 0; t <= PI/2; t += 1/Math.max(w, h)) {
        let xt = x(t),
            yt = y(t);
        point(scalex(xt+x1), scaley(yt+y1));
        point(scalex(-xt+x1), scaley(yt+y1));
        point(scalex(xt+x1), scaley(-yt+y1));
        point(scalex(-xt+x1), scaley(-yt+y1));
    }
}

function ellpBrz(x1, y1, w, h) {
    let x = 0,
        y = h,
        w2 = w**2,
        h2 = h**2,
        d = h2*(x+1)**2+w2*(y-1)**2-w2*h2,
        yf = 0,
        d1,d2;

    point(scalex(x+x1), scaley(y+y1));
    point(scalex(-x+x1), scaley(y+y1));
    point(scalex(x+x1), scaley(-y+y1));
    point(scalex(-x+x1), scaley(-y+y1));
    while (y > yf) {
        if (d < 0) {
            d1 = 2*(d + y * w2) - w2;
            if (d1 < 0) {
                x = x + 1;
                d = d + 2 * x * h2 + h2;
            } else {
                x = x + 1;
                y = y - 1;
                d = d + 2 * (h2 * x - w2 * y) + h2 + w2;
            }
        } else if (d === 0) {
            x = x + 1;
            y = y - 1;
            d = d + 2 * (h2 * x - w2 * y) + h2 + w2;
        } else {
            d2 = 2 * (d - x * h2) - h2;
            if (d2 < 0) {
                x = x + 1;
                y = y - 1;
                d = d + 2 * (h2 * x - w2 * y) + h2 + w2;
            } else {
                y = y - 1;
                d = d - 2 * w2 * y + w2;
            }
        }
        point(scalex(x+x1), scaley(y+y1));
        point(scalex(-x+x1), scaley(y+y1));
        point(scalex(x+x1), scaley(-y+y1));
        point(scalex(-x+x1), scaley(-y+y1));
    }
}

function ellpMPt(x1, y1, w, h) {
    let a = w,
        b = h,
        x = 0,
        y = h,
        a2 = a**2,
        b2 = b**2,
        a2b = a2 * 2,
        b2b = b2 * 2,
        f = b2 - a2*b + a2/4,
        ym = b2/Math.sqrt(a2+b2);

    if (w === 0) {
        line(x1, y1+h, x1, y1-h);return;
    }
    if (h === 0) {
        line(x1+w, y1, x1-w, y1);return;
    }

    point(scalex(x+x1), scaley(y+y1));
    point(scalex(-x+x1), scaley(y+y1));
    point(scalex(x+x1), scaley(-y+y1));
    point(scalex(-x+x1), scaley(-y+y1));
    while (y > ym) {
        if (f < 0) {
            x = x + 1;
            f = f + b2b * x + b2;
        } else {
            x = x + 1;
            y = y - 1;
            f = f + b2b * x + b2 - a2b * y;
        }
        point(scalex(x+x1), scaley(y+y1));
        point(scalex(-x+x1), scaley(y+y1));
        point(scalex(x+x1), scaley(-y+y1));
        point(scalex(-x+x1), scaley(-y+y1));
    }
    f = f + 3 / 4 * (a2 - b2) - a2 * y - b2 * x;
    while (y >= 0) {
        if (f <= 0) {
            x = x + 1;
            y = y - 1;
            f = f - a2b * y + a2 + b2b * x;
        } else {
            y = y - 1;
            f = f - a2b * y + a2;
        }
        point(scalex(x+x1), scaley(y+y1));
        point(scalex(-x+x1), scaley(y+y1));
        point(scalex(x+x1), scaley(-y+y1));
        point(scalex(-x+x1), scaley(-y+y1));
    }
}


function drawEllipse(cent, wh) {
    if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, cent) || !checkInput(/\d{1,10}\.?\d{0,15} \d{1,10}\.?\d{0,15}/, wh)) {return;}

    let method = '1';
    document.getElementsByName('mtd').forEach(e => {if (e.checked) method = e.value});
    clr = document.getElementById('color').value;
    clr = clr.substring(1).split('').reduce((res, e, i) => {if (i % 2 === 0) {res.push(e)} else {res[res.length-1]+=e} return res;}, []).map(e => parseInt(e, 16));

    stroke(...clr);

    if (wh === "0 0")
    {point(...(cent.split(' ').map((e, i) => i ? scaley(parseFloat(e)) : scalex(parseFloat(e))))); return;}

    switch (method) {
        case '1': ellpLib(...(cent+' '+wh).split(' ').map(e => parseFloat(e))); break;
        case '2': ellpCan(...(cent+' '+wh).split(' ').map(e => parseFloat(e))); break;
        case '3': ellpPar(...(cent+' '+wh).split(' ').map(e => parseFloat(e))); break;
        case '4': ellpBrz(...(cent+' '+wh).split(' ').map(e => parseFloat(e))); break;
        case '5': ellpMPt(...(cent+' '+wh).split(' ').map(e => parseFloat(e))); break;
    }
}

function drawTestEllipses(wh0, dwh, n) {
    if (!checkInput(/\d{1,10}\.?\d{0,12} \d{1,10}\.?\d{0,12}/, wh0) || !checkInput(/\d+/, dwh) || !checkInput(/\d+/, n)) {return;}
    let ka = wh0.split(' ').map(e => parseFloat(e)),
        k = ka[0]/ka[1];

    for (let i = 0; i < parseInt(n); i++) {
        console.log(wh0.split(' ').map((e, j) => (parseFloat(e)+parseFloat(dwh)*i/(k**j)).toString()).join(' '));
        drawEllipse('0 0', wh0.split(' ').map((e, j) => (parseFloat(e)+parseFloat(dwh)*i/(k**j)).toString()).join(' '));
    }
}


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
    fill(0, 0, 0);
    rect(0, 0, width, height);
    noFill();
}


function resize() {
    canvas.style.width = container.clientWidth + "px";
    canvas.style.height = container.clientWidth + "px";
}

function scalex(x) {
    return  x + Math.round(width / 2);
}

function scaley(y) {
    return  Math.round(height / 2) - y;
}

function checkInput(reg, str) {
    if (str.match(reg) != str) {
        alert("Incorrect input!");
        return false;
    }
    return true;
}
