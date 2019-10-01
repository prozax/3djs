document.addEventListener('keypress', keyHandler);
var c = document.createElement('canvas');
var ctx = c.getContext('2d');
c.width = c.height = 500;
document.body.appendChild(c);
ctx.translate(250, 250);

var z_buf = [];

var c_pos = {x: 250, y: 250, z: -600};
var c_rot = {x: 0, y: 0.5, z: 0};

var e = {x: 0, y: 0, z: 200};

var polygons = [];

var p1 = [
    {x: 150, y: 350, z: 0},
    {x:  350, y: 350, z: 0},
    {x: 150, y: 150, z: 0},
]
polygons.push({v: p1, color: 'red'});

var p2 = [
    {x:  350, y: 350, z: 0},
    {x:  350, y: 150, z: 0},
    {x: 150, y: 150, z: 0},
]
polygons.push({v: p2, color: 'red'});

var p3 = [
    {x: 150, y: 350, z: 0},
    {x:  150, y: 350, z: -100},
    {x: 150, y: 150, z: 0},
]
polygons.push({v: p3, color: 'blue'});

var p4 = [
    {x:  150, y: 350, z: -100},
    {x:  150, y: 150, z: -100},
    {x: 150, y: 150, z: 0},
]
polygons.push({v: p4, color: 'blue'});

var p5 = [
    {x: 350, y: 350, z: 0},
    {x:  350, y: 350, z: -100},
    {x: 350, y: 150, z: 0},
]
polygons.push({v: p5, color: 'green'});

var p6 = [
    {x:  350, y: 350, z: -100},
    {x:  350, y: 150, z: -100},
    {x: 350, y: 150, z: 0},
]
polygons.push({v: p6, color: 'green'});

var p7 = [
    {x: 350, y: 350, z: 0},
    {x:  350, y: 350, z: -100},
    {x: 150, y: 350, z: 0},
]
polygons.push({v: p7, color: 'yellow'});

var p8 = [
    {x:  350, y: 350, z: -100},
    {x:  150, y: 350, z: -100},
    {x: 150, y: 350, z: 0},
]
polygons.push({v: p8, color: 'yellow'});

var p9 = [
    {x: 350, y: 150, z: 0},
    {x:  350, y: 150, z: -100},
    {x: 150, y: 150, z: 0},
]
polygons.push({v: p9, color: 'orange'});

var p10 = [
    {x:  350, y: 150, z: -100},
    {x:  150, y: 150, z: -100},
    {x: 150, y: 150, z: 0},
]
polygons.push({v: p10, color: 'orange'});

function render() {
    z_buf = Array(500*500).fill(Infinity);
    ctx.clearRect(-250, -250, 500, 500);

    // c_rot.x += 0.001;
    // c_rot.y += 0.001;
    // c_rot.z += 0.01;
    // console.log(c_rot);

    // c_pos.x += 1;
    // c_pos.y += 1;
    // c_pos.z += 0.1;
    // console.log(c_pos);

    // e.x += 0.1;
    // e.y += 0.1;
    // e.z -= 0.1;
    // console.log(e);

    polygons.forEach(p => {
        drawFace(p.v, p.color);
    })

    // requestAnimationFrame(loop);
}

render();


function drawFace(polygon, c) {
    ctx.beginPath();

    var d = transform(polygon);
    var b = to2D(d);

    b.push(b[0]);

    b.forEach(p => {
        ctx.lineTo(p.x, p.y);
    });

    ctx.stroke();

    var bb = findBoundingBox(b);

    for(var x = bb.xmin; x <= bb.xmax; ++x) {
        for(var y = bb.ymin; y <= bb.ymax; ++y) {
            if(isInside(b, {x: x, y: y})) {
                var bc = barycentric(b, {x: x, y: y});
                if(bc.x >= 0 && bc.y >= 0 && bc.z >=0) {
                    var z = 0;
                    z += d[0].z  * bc.x;
                    z += d[1].z  * bc.y;
                    z += d[2].z  * bc.z;
                    
                    if(z_buf[Math.round(x+250) + Math.round(y+250)*500] > z) {
                        // console.log(z_buf[x + y*500]);
                        z_buf[Math.round(x+250) + Math.round(y+250)*500] = z;
                        ctx.fillStyle = c;
                        ctx.fillRect(x, y, 1, 1);
                    }

                }

            }
        }
    }
}

function findBoundingBox(polygon) {
    var bb = { xmin: polygon[0].x, xmax: polygon[0].x, ymin: polygon[0].y, ymax: polygon[0].y};

    polygon.forEach(p => {
        bb.xmin = p.x < bb.xmin ? p.x : bb.xmin;
        bb.xmax = p.x > bb.xmax ? p.x : bb.xmax;
        bb.ymin = p.y < bb.ymin ? p.y : bb.ymin;
        bb.ymax = p.y > bb.ymax ? p.y : bb.ymax;
    });

    return bb;
}

function transform(polygon) {
    var transformed_polygon = [];

    polygon.forEach(p => {
        var d = {x: p.x - c_pos.x, y: p.y - c_pos.y, z: p.z - c_pos.z};
        var sin = {x: Math.sin(c_rot.x), y: Math.sin(c_rot.y), z: Math.sin(c_rot.z)};
        var cos = {x: Math.cos(c_rot.x), y: Math.cos(c_rot.y), z: Math.cos(c_rot.z)};

        d.x = cos.y * (sin.z * d.y + cos.z * d.x) - sin.y * d.z;
        d.y = sin.x * (cos.y * d.z + sin.y * (sin.z * d.y + cos.z * d.x)) + cos.x * (cos.z * d.y - sin.z * d.x);
        d.z = cos.x * (cos.y * d.z + sin.y * (sin.z * d.y + cos.z * d.x)) - sin.x * (cos.z * d.y - sin.z * d.x);

        transformed_polygon.push(d);
    });

    return transformed_polygon;
}

function to2D(polygon) {
    var b = [];

    polygon.forEach(p => {
        var b_point = {x: (e.z/p.z) * p.x + e.x, y: (e.z/p.z) * p.y + e.y};

        if(b_point.y < -250 || b_point.y > 250) console.log(b_point);

        b.push(b_point);
    });

    return b;
}

function isInside(polygon, point) {
    var result = false;
    var i,j;
    for (i = 0, j = polygon.length- 1; i < polygon.length; j = i++) {
        if ((polygon[i].y > point.y) != (polygon[j].y > point.y) &&
                (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) /
                        (polygon[j].y-polygon[i].y) + polygon[i].x)) {
            result = !result;
        }
    }
    return result;
}

function keyHandler(e) {
    console.log(e.code);
    switch(e.code) {
        case 'KeyW': c_pos.z += 5;
            break;
        case 'KeyS': c_pos.z -= 5;
            break;
        case 'KeyA': c_pos.x -= 5;
            break;
        case 'KeyD': c_pos.x += 5;
            break;
        case 'KeyR': c_pos.y += 5;
            break;
        case 'KeyF': c_pos.y -= 5;
            break;
        case 'KeyQ': c_rot.y += 0.01;
            break;
        case 'KeyE': c_rot.y -= 0.01;
            break;
    }

    var t0 = performance.now();
    render();
    var t1 = performance.now();
    console.log("Call to render took " + (t1 - t0) + " ms.");
    
}

function cross(a, b) {
    var res = {
        x: a.y * b.z - a.z * b.y, 
        y: a.z * b.x - a.x * b.z, 
        z: a.x * b.y - a.y * b.x
    };

    return res;
}

function barycentric(pts, P) {
    var v1 = {
        x: pts[2].x - pts[0].x,
        y: pts[1].x - pts[0].x,
        z: pts[0].x - P.x
    };

    var v2 = {
        x: pts[2].y - pts[0].y,
        y: pts[1].y - pts[0].y,
        z: pts[0].y - P.y
    };

    var u = cross(v1, v2);

    return {
        x: 1 - (u.x + u.y) / u.z,
        y: u.y / u.z,
        z: u.x / u.z
    }
}