const   container = document.getElementById('canvas');

let     clr = "#FFFFFF";


class Figure {
    constructor() {
        this.points = {x:[], y:[]};
        this.edges = [];
        this.edge_set_is_completed = true;
        this.canvas_color = "#FFFFFF";
        this.edge_color = "#000000";
        this.paint_color = "#FF0000";
        this.divider_color = "#00FF00";
        this.mode = false;
    }

    set_color(p_id, b_id, d_id, c_id) {
        this.edge_color = document.getElementById(b_id).value;
        this.paint_color = document.getElementById(p_id).value;
        this.divider_color = document.getElementById(d_id).value;
        this.canvas_color = document.getElementById(c_id).value;
    }

    set_mode(m_id) {
        this.mode = document.getElementById(m_id).checked;
    }

    add_point(xy_id) {
        let x, y;

        if (!xy_id) {
            let ev = window.event;

            if (ev.ctrlKey) {
                if (this.points.x.length === 0) {return;}
                x = this.points.x[this.points.x.length-1];
            } else {
                x = ev.pageX - container.offsetLeft;
            }
            if (ev.altKey) {
                if (this.points.y.length === 0) {return;}
                y = this.points.y[this.points.y.length-1];
            } else {
                y = ev.pageY - container.offsetTop;
            }
        } else {
            let xy = document.getElementById(xy_id).value;

            if (!checkInput(/\d{1,10} \d{1,10}/, xy)) {return;}

            [x, y] = xy.split(' ').map(e => parseInt(e));
        }

        this.points.x.push(x);
        this.points.y.push(y);
        if (this.edge_set_is_completed) {
            this.edge_set_is_completed = false;
            this.add_edge_set(this.points.x.length-1);
        }
    }

    add_edge_set(i) {
        this.edges.push(i);
    }

    complete_edge_set() {
        this.edge_set_is_completed = true;
    }

    async paint_edge_set(xm) {
        let self = this;

        let paint_edge = async function (e, pixels) {
            let i1 = Math.min(e[1], e[3]),
                i2 = Math.max(e[1], e[3]),
                d = (e[0]-e[2])/(e[1]-e[3]);
            let x = y => Math.round(d*(y-e[3])+e[2]);
            let c_clr = convertColor(self.canvas_color),
                p_clr = convertColor(self.paint_color);

            let fill_px = function (x, y, pixels) {
                let index = ((y*width)+x)*4,
                    c = [pixels[index], pixels[index+1], pixels[index+2]];
                if (c[0] === p_clr[0] && c[1] === p_clr[1] && c[2] === p_clr[2]) {
                    pixels[index] = c_clr[0];
                    pixels[index+1] = c_clr[1];
                    pixels[index+2] = c_clr[2];
                } else {
                    pixels[index] = p_clr[0];
                    pixels[index+1] = p_clr[1];
                    pixels[index+2] = p_clr[2];
                }
            };

            let fill_px_check = function(y, xm, pixels) {
                if (x(y) < xm) {
                    for (let j = x(y); j < xm; j++) {
                        fill_px(Math.round(j), y, pixels);
                    }
                } else {
                    for (let j = x(y)-1; j >= xm; j--) {
                        fill_px(Math.round(j), y, pixels);
                    }
                }
            };

            let paint_edge_fast = function (i1, i2, pixels) {
                for (let y = i1; y < i2; y++) {
                    fill_px_check(y, xm, pixels);
                }
            };
            let paint_edge_delay = async function (y, i2, pixels) {
                function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

                for (let y = i1; y < i2; y++) {
                    fill_px_check(y, xm, pixels);
                    await sleep(10);
                    updatePixels();
                }
            };

            if (self.mode)
                await paint_edge_delay(i1, i2, pixels);
            else
                paint_edge_fast(i1, i2, pixels);
        };

        loadPixels();

        for (let i = 0; i < this.edges.length; i++) {
            for (let j = this.edges[i]; j < (this.edges[i+1]||this.points.x.length)-1; j++) {
                await paint_edge([this.points.x[j], this.points.y[j], this.points.x[j+1], this.points.y[j+1]], pixels);
            }
            await paint_edge([this.points.x[(this.edges[i+1]||this.points.x.length)-1], this.points.y[(this.edges[i+1]||this.points.x.length)-1], this.points.x[this.edges[i]], this.points.y[this.edges[i]]], pixels);
        }

        updatePixels();
    }

    _get_div_x() {
        let x1 = container.clientWidth, x2 = 0, xm, dxm;

        x1 = Math.min(x1, ...(this.points.x));
        x2 = Math.max(x2, ...(this.points.x));
        xm = Math.floor((x1+x2)/2);
        dxm = this.points.x[0]-xm;

        dxm = this.points.x.reduce((r, e) => {return (Math.abs(e-xm) < Math.abs(r)) ? e-xm : r;}, dxm);

        return xm+dxm;
    }

    _draw_div(xm) {
        stroke(...convertColor(this.divider_color));
        line(xm, 0, xm, container.clientWidth);
    }

    draw() {
        let xm = this._get_div_x();
        let self = this;
        let set_waiting = function () {
            document.getElementById("message").innerText = "Drawing...";
        };

        set_waiting();
        let timerId = setTimeout(function () {
            self.paint_edge_set(xm).then(function () {
                document.getElementById("message").innerText = "Done!";
                self._draw_div(xm);
            });
        });
    }

    reset() {
        this.points.x = [];
        this.points.y = [];
        this.edges = [];
        this.edge_set_is_completed = true;
    }
}


let figure = new Figure();


function setup() {
    let canvas = createCanvas(container.clientWidth, container.clientWidth);

    canvas.parent('canvas');
    canvas.class("border no-gutters");
    canvas.id("canvasPage");
    pixelDensity(1);

    window.onresize = resize.bind(this);

    noStroke();
    fill(...convertColor(figure.canvas_color));
    rect(0, 0, width, height);
    noFill();
}

function draw() {
    stroke(...convertColor(figure.edge_color));

    for (let i = 0; i < figure.edges.length; i++) {
        for (let j = figure.edges[i]; j < (figure.edges[i+1]||(figure.points.x.length))-1; j++) {
            ellipse(figure.points.x[j], figure.points.y[j], 2, 2);
            lineDDA(figure.points.x[j], figure.points.y[j], figure.points.x[j+1], figure.points.y[j+1])
        }
        ellipse(figure.points.x[(figure.edges[i+1]||figure.points.x.length)-1], figure.points.y[(figure.edges[i+1]||figure.points.x.length)-1], 2, 2);
        lineDDA(figure.points.x[(figure.edges[i+1]||figure.points.x.length)-1], figure.points.y[(figure.edges[i+1]||figure.points.x.length)-1], figure.points.x[figure.edges[i]], figure.points.y[figure.edges[i]])
    }

    if (!figure.edge_set_is_completed) {
        document.getElementById('figure-state').innerText = "Figure is not finished!";
    } else {
        document.getElementById('figure-state').innerText = "Add point to start a figure!";
    }
}

function refresh() {
    let c_clr = convertColor(figure.canvas_color);

    loadPixels();
    for (let i = 0; i < (width*width)*4; i+=4)
    {
        pixels[i] = c_clr[0];
        pixels[i+1] = c_clr[1];
        pixels[i+2] = c_clr[2];
    }
    updatePixels();
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

function lineDDA(x1, y1, x2, y2) {
    let dx = x2 - x1,
        dy = y2 - y1,
        l = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy),
        sx = dx / l,
        sy = dy / l,
        x = x1,
        y = y1;

    for (let i = 1; i < l+1; i++) {
        point(x, y);
        x = x+sx; y = y+sy;
    }
}

function convertColor(clr) {
    return clr.substring(1).split('').reduce((res, e, i) => {if (i % 2 === 0) {res.push(e)} else {res[res.length-1]+=e} return res;}, []).map(e => parseInt(e, 16));
}

