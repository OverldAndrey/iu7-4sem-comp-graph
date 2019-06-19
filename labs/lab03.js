const   container = document.getElementById('canvas');

let     clr = "#FFFFFF";


function lineLib(x1, y1, x2, y2) {
    line(scalex(x1), scaley(y1), scalex(x2), scaley(y2));
}

function lineDDA(x1, y1, x2, y2) {
    let dx = x2 - x1,
        dy = y2 - y1,
        l = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy),
        sx = dx / l,
        sy = dy / l,
        x = x1,
        y = y1;

    for (let i = 1; i < l+1; i++) {
        point(scalex(x), scaley(y));
        x = x+sx; y = y+sy;
    }
}

function lineBrF(x1, y1, x2, y2) {
    let dx = x2 - x1,
        dy = y2 - y1,
        sx = Math.sign(dx),
        sy = Math.sign(dy);

    dx = Math.abs(dx);
    dy = Math.abs(dy);

    let ch = dx <= dy;

    if (ch) {let t = dx; dx = dy; dy = t;}

    let m = dy / dx,
        e = m - 1 / 2,
        x = x1,
        y = y1;

    for (let i = 1; i < dx + 1; i++) {
        point(scalex(x), scaley(y));
        if (e > 0) {
            if (ch) {x = x + sx;} else {y = y + sy;}
            e = e - 1;
        }
        if (e <= 0) {
            if (ch) {y = y + sy;} else {x = x + sx;}
        }
        e = e + m;
    }
}

function lineBrI(x1, y1, x2, y2) {
    let dx = x2 - x1,
        dy = y2 - y1,
        sx = Math.sign(dx),
        sy = Math.sign(dy);

    dx = Math.abs(dx);
    dy = Math.abs(dy);

    let ch = dx <= dy;

    if (ch) {let t = dx; dx = dy; dy = t;}

    let e = 2 * dy - dx,
        x = x1,
        y = y1;

    for (let i = 1; i < dx + 1; i++) {
        point(scalex(x), scaley(y));
        if (e > 0) {
            if (ch) {x = x + sx;} else {y = y + sy;}
            e = e - 2 * dx;
        }
        if (e <= 0) {
            if (ch) {y = y + sy;} else {x = x + sx;}
        }
        e = e + 2 * dy;
    }
}

function lineBrS(x1, y1, x2, y2) {
    let dx = x2 - x1,
        dy = y2 - y1,
        sx = Math.sign(dx),
        sy = Math.sign(dy),
        I = 255;

    dx = Math.abs(dx);
    dy = Math.abs(dy);

    let ch = dx <= dy;

    if (ch) {let t = dx; dx = dy; dy = t;}

    let m0 = dy / dx,
        e = I / 2,
        m = m0 * I,
        w = I - m,
        x = x1,
        y = y1,
        xa = (ch) ? x1 - sx : x1,
        ya = (ch) ? y1 : y1 - sy,
        acolor = [...clr];

    acolor.push(e);

    for (let i = 1; i <= dx; i++) {
        if (e < w) {
            if (ch) {y = y + sy; ya = ya + sy;} else {x = x + sx; xa = xa + sx;}
            e = e + m;
        } else
        if (e >= w) {
            x = x + sx; xa = xa + sx;
            y = y + sy; ya = ya + sy;
            e = e - w;
        }
        acolor[3] = Math.round(e);
        stroke(...acolor);
        point(scalex(x), scaley(y));
        acolor[3] = Math.round(I - e);
        stroke(...acolor);
        point(scalex(xa), scaley(ya));
    }
}

function lineWuS(x1, y1, x2, y2) {
    if (x2 < x1 || (x1 === x2 && y2 < y1)) {let t = x1; x1 = x2; x2 = t;
                                                t = y1; y1 = y2; y2 = t;}

    let ip = function (n) {return Math.floor(n);},
        fp = function (n) {return n - ip(n);};

    let ch = Math.abs(x2 - x1) <= Math.abs(y2 - y1);

    if (ch && (x1*y1<0||x2*y2<0)) {let t = x1; x1 = x2; x2 = t;
                                       t = y1; y1 = y2; y2 = t;}
    if (ch) {let t = x1; x1 = y1; y1 = t;}
    if (ch) {let t = x2; x2 = y2; y2 = t;}

    // alert([x1, y1, x2, y2]);

    let dx = x2 - x1,
        dy = y2 - y1,
        I = 255,
        m0 = dy / dx,
        acolor = [...clr],
        y = y1;
    acolor.push(I);

    // alert([x1, y1, x2, y2, m0]);

    for (let x = x1; x <= x2; x++) {
        if (ch) {
            acolor[3] = (1-fp(y)) * I;
            stroke(...acolor);
            point(scalex(Math.floor(y)), scaley(x));
            acolor[3] = fp(y) * I;
            stroke(...acolor);
            point(scalex(Math.floor(y)+1), scaley(x));
        } else {
            acolor[3] = (1-fp(y)) * I;
            stroke(...acolor);
            point(scalex(x), scaley(Math.floor(y)));
            acolor[3] = fp(y) * I;
            stroke(...acolor);
            point(scalex(x), scaley(Math.floor(y)+1));
        }
        y += m0;
    }
}

function drawLine(coord1, coord2) {
    if (!checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, coord1) || !checkInput(/-?\d{1,10}\.?\d{0,12} -?\d{1,10}\.?\d{0,12}/, coord2)) {return;}

    let method = '1';
    document.getElementsByName('mtd').forEach(e => {if (e.checked) method = e.value});
    clr = document.getElementById('color').value;
    clr = clr.substring(1).split('').reduce((res, e, i) => {if (i % 2 === 0) {res.push(e)} else {res[res.length-1]+=e} return res;}, []).map(e => parseInt(e, 16));

    stroke(...clr);

    if (coord1.split(' ')[0] === coord2.split(' ')[0] && coord1.split(' ')[1] === coord2.split(' ')[1])
    {point(...(coord1.split(' ').map((e, i) => i ? scaley(parseFloat(e)) : scalex(parseFloat(e))))); return;}

    switch (method) {
        case '1': lineLib(...(coord1+' '+coord2).split(' ').map(e => parseFloat(e))); break;
        case '2': lineDDA(...(coord1+' '+coord2).split(' ').map(e => parseFloat(e))); break;
        case '3': lineBrF(...(coord1+' '+coord2).split(' ').map(e => parseFloat(e))); break;
        case '4': lineBrI(...(coord1+' '+coord2).split(' ').map(e => parseFloat(e))); break;
        case '5': lineBrS(...(coord1+' '+coord2).split(' ').map(e => parseFloat(e))); break;
        case '6': lineWuS(...(coord1+' '+coord2).split(' ').map(e => parseFloat(e))); break;
    }
}

function drawTestLines(l, dfi) {
    if (!checkInput(/\d+/, l) || !checkInput(/\d+/, dfi)) {return;}

    for (let i = 0; i < 360; i = i + parseInt(dfi)) {
        drawLine('0 0', Math.round(l * Math.cos(i / 180 * Math.PI)) + ' ' + Math.round(l * Math.sin(i / 180 * Math.PI)));
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
