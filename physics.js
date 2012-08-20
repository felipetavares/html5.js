function v_dot (v1,v2) {
    return v1[0]*v2[0]+v1[1]*v2[1];
} 

function v_len (v) {
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]); 
}

function v_normalize (v1) {
	v = [0,0];
	l = Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]);
	v[0] = v1[0]/l;
	v[1] = v1[1]/l;
	
	return v;
}

function CollisionInfo (x,y,vx,vy) {
    this.p = [x,y];
    this.d = [vx,vy];
}

function Physics () {
    this.s_objects = []; /* Static objects */
    this.d_objects = []; /* Dynamic ones   */

	this.collisionCallback = false;
	this.collision = false;
	
    this.step = function () {
	for (d=0;d<this.d_objects.length;d++) {
		this.d_objects[d].v[0] += this.d_objects[d].a[0];
		this.d_objects[d].v[1] += this.d_objects[d].a[1];

		if (this.d_objects[d]._onFloor) {
			this.d_objects[d]._onFloor = false;
			this.d_objects[d].onFloor = true;
		}
		else if (this.d_objects[d].onFloor) {
			this.d_objects[d].onFloor = false;
		}

		if (this.collision) {
			if (this.collisionCallback) {
				this.collisionCallback(this.collision[0],this.collision[1]);
			}
			this.collision = false;
		}

	    for (s=0;s<this.s_objects.length;s++) {
		if (cf = this.circleAABB(this.d_objects[d],this.s_objects[s])) {			
		    d_real = v_len(cf.d)-this.d_objects[d].r;
		    d_run = -v_dot(this.d_objects[d].v,v_normalize(cf.d));
			d_run_old = v_len(this.d_objects[d].v);
			

		    if (d_run > d_real) {
				if (this.s_objects[s].r) {
					this.d_objects[d].v[0] += (d_run-d_real)*((this.normalize(cf.d[0],cf.d[1])[0]));
					this.d_objects[d].v[1] += (d_run-d_real)*((this.normalize(cf.d[0],cf.d[1])[1]));
				
					if (v_dot(v_normalize(cf.d),this.d_objects[d].floor) == 1.0)
						this.d_objects[d]._onFloor = true;
				
					if (this.d_objects[d].v[0] != 0) {
						this.d_objects[d].v[0] *= this.d_objects[d].f * this.s_objects[s].f;
					}
					if (this.d_objects[d].v[1] != 0) {
						this.d_objects[d].v[1] *= this.d_objects[d].f * this.s_objects[s].f;
					}
				}
				if (!this.collision) {
					this.collision = [0,0];
					this.collision[0] = this.s_objects[s];
					this.collision[1] = this.d_objects[d];
				}
			}
		}
	    }
    this.d_objects[d].step();
	}   
    }

    /* 
     * Collision detection and response
     * functions goes here 
     */
    this.normalize = function (x,y) {
	v = [0,0];
	l = Math.sqrt(x*x+y*y);
	v[0] = x/l;
	v[1] = y/l;
	
	return v;
    }

    this.clamp = function (v,min,max) {
	if (v > max)
	    v = max;
	else if (v < min)
	    v = min;

	return v;
    }

    this.circleAABB = function (circle,aabb) {
	closestX = this.clamp(circle.p[0], aabb.p[0], aabb.p[0]+aabb.s[0]);
	closestY = this.clamp(circle.p[1], aabb.p[1], aabb.p[1]+aabb.s[1]);

	distanceX = circle.p[0] - closestX;
	distanceY = circle.p[1] - closestY;

	cf = new CollisionInfo(closestX,closestY,distanceX,distanceY);
	return cf;
	}
	
    this.pushCircle = function (circle,cf) {
	vn = this.normalize(cf.d[0],cf.d[1]);

	e = 0.5;

	circle.v[0] -= (1+e)*vn[0]*(circle.v[0]*vn[0]);
	circle.v[1] -= (1+e)*vn[1]*(circle.v[1]*vn[1]);

	vn[0] *= circle.r;
	vn[1] *= circle.r;

	circle.p[0] += vn[0]-cf.d[0];
	circle.p[1] += vn[1]-cf.d[1];

	return vn;
    }   
}

function DynamicObject () {
    this.r = 16;

	this.f = 1.0;

    this.p = [0,0];
    this.v = [0,0];
    this.a = [0,0];

	this.onFloor = false;
	this._onFloor = false; /* Player *will* be on floor, next frame */
	this.floor = [0,-1];
	
	this.cg = 1;
	
    this.step = function () {	
	this.p[0] += this.v[0];
	this.p[1] += this.v[1];
    }
}

function StaticObject () {
    this.p = [0,0];
    this.s = [32,32];
    this.f = 1.0;
	this.cg = 1;
	
	this.r = true; /* Collision response? */
}

/* Sample debugging code */
/* Please comment if not using*/
/*
html5.getCanvas2dContext();

function clearScreen (color) {
    if (!color)
	color = 'white';

    html5.context.fillStyle = color;
    html5.context.fillRect (0,0,640,480);
}

physics = new Physics();

s = new StaticObject ();
s.p[1] = 420;
s.p[0] = 20;
s.s[0] = 600;
s.s[1] = 2;
s.f = 0.99;
physics.s_objects.push(s);

s = new StaticObject ();
s.p[1] = 350;
s.p[0] = 280;
s.s[0] = 40;
s.s[1] = 2;
s.f = 0.9;
physics.s_objects.push(s);

s = new StaticObject ();
s.p[1] = 300;
s.p[0] = 350;
s.s[0] = 200;
s.s[1] = 100;
s.f = 0.8;
s.cg = 10;
physics.s_objects.push(s);

d = new DynamicObject ();
d.p[0] = 30;
d.p[1] = 240;
d.a[1] = 0.1;
d.cg = 10;
d.r = 32;
physics.d_objects.push(d);

physics.collisionCallback = html5.hitch(onCollision,this);

function onCollision (s,d) {
	if (s.cg == 10 && d.cg == 10 && d.onFloor) {// Win group - > player group
		
	}
}

function update () {
    clearScreen();

    physics.step();

    // DRAW ALL OBJECTS 
    for (o=0;o<physics.s_objects.length;o++) {
	html5.context.fillStyle='#000';
	html5.context.fillRect(physics.s_objects[o].p[0],physics.s_objects[o].p[1],
		 physics.s_objects[o].s[0],physics.s_objects[o].s[1]);
    }
    for (o=0;o<physics.d_objects.length;o++) {
	html5.context.fillStyle='#0f0';
	html5.context.strokeStyle = '#00f';
	html5.context.beginPath();
	html5.context.arc (physics.d_objects[o].p[0],physics.d_objects[o].p[1],physics.d_objects[o].r,0,Math.PI*2,false); 
	html5.context.fill();
	html5.context.stroke();
    }
    // ----------------

    if (html5.keyboard[html5.keyUp] && physics.d_objects[0].onFloor)
	physics.d_objects[0].v[1]-=2;
    if (html5.keyboard[html5.keyDown] && physics.d_objects[0].onFloor)
	physics.d_objects[0].v[1]+=1;
    if (html5.keyboard[html5.keyLeft] && physics.d_objects[0].onFloor)
	physics.d_objects[0].v[0]-=0.1;
    if (html5.keyboard[html5.keyRight] && physics.d_objects[0].onFloor)
	physics.d_objects[0].v[0]+=0.1;

    setTimeout(update,0);
}

if (html5.context)
    update();

*/ 