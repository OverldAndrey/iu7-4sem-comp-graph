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
        this.mode = false;
    }

    set_color(p_id, b_id, c_id) {
        this.edge_color = document.getElementById(b_id).value;
        this.paint_color = document.getElementById(p_id).value;
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

    async paint_fig(sx, sy) {
        let self = this;
        let stack = [];

        let cmp_color = function(c, pixels, index) {
            return c[0] === pixels[index] && c[1] === pixels[index+1] && c[2] === pixels[index+2];
        };
        function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

        stack.push([sx, sy]);

        loadPixels();

        //let c_c = get(sx, sy);

        while (stack.length > 0) {
            let cur = stack.pop(),
                lp = cur.slice(0),
                rp = cur.slice(0),
                index = ((cur[1]*width)+cur[0])*4,
                p_c = convertColor(this.paint_color),
                c_c = convertColor(this.canvas_color),
                b_c = convertColor(this.edge_color);

            while (cmp_color(c_c, pixels, index) && rp[0] < width) {
                pixels[index] = p_c[0];
                pixels[index+1] = p_c[1];
                pixels[index+2] = p_c[2];
                index += 4;
                rp[0] += 1;
            }
            index -= (rp[0] - cur[0] + 1)*4;
            while (cmp_color(c_c, pixels, index) && lp[0] > 0) {
                pixels[index] = p_c[0];
                pixels[index+1] = p_c[1];
                pixels[index+2] = p_c[2];
                index -= 4;
                lp[0] -= 1;
            }

            let fl = false;

            if (this.mode) {
                await sleep(4);
                updatePixels();
            }

            index = ((lp[1]*width)+lp[0])*4;

            if (lp[0] === rp[0]-1) {
                if (cmp_color(c_c, pixels, index-width*4)) {
                    stack.push([cur[0], cur[1]-1]);
                }
                if (cmp_color(c_c, pixels, index+width*4)) {
                    stack.push([cur[0], cur[1]+1]);
                }
                continue;
            }

            for (let i = lp[0]+1; i <= rp[0]; i++) {
                if (!fl && cmp_color(c_c, pixels, index-width*4+(i-lp[0]-1)*4)) {
                    fl = true;
                } else if (fl && !cmp_color(c_c, pixels, index-width*4+(i-lp[0]-1)*4)) {
                    stack.push([i-1, cur[1]-1]);
                    fl = false;
                }
            }
            if (fl) {
                stack.push([rp[0]-1, cur[1]-1]);
            }

            fl = false;

            for (let i = lp[0]+1; i <= rp[0]; i++) {
                if (!fl && cmp_color(c_c, pixels, index+width*4+(i-lp[0]-1)*4)) {
                    fl = true;
                } else if (fl && !cmp_color(c_c, pixels, index+width*4+(i-lp[0]-1)*4)) {
                    stack.push([i-1, cur[1]+1]);
                    fl = false;
                }
            }
            if (fl) {
                stack.push([rp[0]-1, cur[1]+1]);
            }
        }

        updatePixels();
    }

    async draw() {
        let self = this;
        let ev = window.event;
        let set_waiting = function () {
            document.getElementById("message").innerText = "Drawing...";
        };

        set_waiting();
        let timerId = setTimeout(function () {
            self.paint_fig(ev.pageX - container.offsetLeft, ev.pageY - container.offsetTop).then(function () {
                document.getElementById("message").innerText = "Done!";
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
    strokeWeight(1);
    noFill();
    noLoop();
}

function draw() {
    stroke(...convertColor(figure.edge_color), 255);

    loadPixels();
    for (let i = 0; i < figure.edges.length; i++) {
        for (let j = figure.edges[i]; j < (figure.edges[i+1]||(figure.points.x.length))-1; j++) {
            // ellipse(figure.points.x[j], figure.points.y[j], 2, 2);
            noSmooth();
            lineDDA(pixels, figure.points.x[j], figure.points.y[j], figure.points.x[j+1], figure.points.y[j+1]);
        }
        // ellipse(figure.points.x[(figure.edges[i+1]||figure.points.x.length)-1], figure.points.y[(figure.edges[i+1]||figure.points.x.length)-1], 2, 2);
        if (i !== figure.edges.length-1 || figure.edge_set_is_completed) {
            noSmooth();
            lineDDA(pixels, figure.points.x[(figure.edges[i+1]||figure.points.x.length)-1], figure.points.y[(figure.edges[i+1]||figure.points.x.length)-1], figure.points.x[figure.edges[i]], figure.points.y[figure.edges[i]]);
        }
    }
    updatePixels();

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

function lineDDA(pixels, x1, y1, x2, y2) {
    let dx = x2 - x1,
        dy = y2 - y1,
        l = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy),
        sx = dx / l,
        sy = dy / l,
        x = x1,
        y = y1,
        b_clr = convertColor(figure.edge_color);

    for (let i = 1; i < l+1; i++) {
        let index = ((Math.round(y)*width)+Math.round(x))*4;
        pixels[index] = b_clr[0];
        pixels[index+1] = b_clr[1];
        pixels[index+2] = b_clr[2];
        x = x+sx; y = y+sy;
    }
}

function convertColor(clr) {
    return clr.substring(1).split('').reduce((res, e, i) => {if (i % 2 === 0) {res.push(e)} else {res[res.length-1]+=e} return res;}, []).map(e => parseInt(e, 16));
}

async function click_listener() {
    if (event.which === 3) {return;}

    if (document.body.style.cursor === "default") {
        figure.add_point();
        refresh();
        draw();
        container.addEventListener("mousemove", move_listener);
    } else {
        document.body.style.cursor = "default";
        figure.set_mode('slow-mode');
        await figure.draw();
    }
}

function right_click_listener() {
    if (document.body.style.cursor === "default") {
        figure.complete_edge_set();
        refresh();
        draw();
    } else {
        document.body.style.cursor = "default";
    }
}

function move_listener(e) {
    figure.add_point();
    draw();
}

