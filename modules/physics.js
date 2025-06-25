const Matter = window.Matter;

export const physics = (function () {
    const bodies = [];
    let engine;
    let world;

    function init(gravityX = 0, gravityY = 1) {
        engine = Matter.Engine.create();
        world = engine.world;
        world.gravity.x = gravityX;
        world.gravity.y = gravityY;
        setupCollisionEvents();
    }

    function newBody({
        x = 0, y = 0, width = 0, height = 0, radius = 0,
        shape = 'rectangle', type = 'dynamic', gravity = true,
        friction = 0.1, restitution = 0.1, density = 0.001,
        pushFactor = 0.3, vertices = null,
        isSensor = false, canRotate = false
    }) {
        let matterBody;
        const isStatic = (type === 'static' || type === 'sensor');

        const options = {
            isStatic,
            friction,
            restitution,
            density,
            isSensor: type === 'sensor' || isSensor
        };
        if (!canRotate) {
            options.inertia = Infinity;
            options.angle = 0;
        }


        if (shape === 'rectangle') {
            matterBody = Matter.Bodies.rectangle(x + width / 2, y + height / 2, width, height, options);
        } else if (shape === 'circle') {
            matterBody = Matter.Bodies.circle(x + radius, y + radius, radius, options);
        } else if (shape === 'polygon' && vertices) {
            matterBody = Matter.Bodies.fromVertices(x, y, [vertices], options);
        } else {
            console.warn(`Shape '${shape}' not supported or missing vertices.`);
            return null;
        }

        matterBody.customData = {
            type,
            gravity,
            pushFactor,
            grounded: false,
            drawInfo: { x, y, width, height, radius, shape },
        };

        Matter.World.add(world, matterBody);

        const body = {
            matterBody,
            get x() { return matterBody.position.x - (matterBody.bounds.max.x - matterBody.bounds.min.x) / 2; },
            get y() { return matterBody.position.y - (matterBody.bounds.max.y - matterBody.bounds.min.y) / 2; },
            get vx() { return matterBody.velocity.x; },
            get vy() { return matterBody.velocity.y; },
            get width() { return matterBody.bounds.max.x - matterBody.bounds.min.x; },
            get height() { return matterBody.bounds.max.y - matterBody.bounds.min.y; },
            get radius() { return (shape === 'circle') ? matterBody.circleRadius : 0; },
            get grounded() { return matterBody.customData.grounded; },
            set vx(value) { Matter.Body.setVelocity(matterBody, { x: value, y: matterBody.velocity.y }); },
            set vy(value) { Matter.Body.setVelocity(matterBody, { x: matterBody.velocity.x, y: value }); },
            set x(value) { Matter.Body.setPosition(matterBody, { x: value + body.width / 2, y: matterBody.position.y }); },
            set y(value) { Matter.Body.setPosition(matterBody, { x: matterBody.position.x, y: value + body.height / 2 }); },
            shape,
            type,
            gravity,
            friction,
            pushFactor,
            mass: matterBody.mass,
            vertices
        };

        bodies.push(body);
        return body;
    }

    function update(dt) {
        Matter.Engine.update(engine, dt * 1000);
    }

    function setGravity(body, enabled) {
        if (!enabled) {
            Matter.Body.applyForce(body.matterBody, body.matterBody.position, {
                x: -world.gravity.x * body.matterBody.mass,
                y: -world.gravity.y * body.matterBody.mass
            });
        }
        // Você também pode armazenar esse estado, se quiser resetar depois
        body.gravity = enabled;
    }

    function setupCollisionEvents() {
        Matter.Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const a = pair.bodyA;
                const b = pair.bodyB;

                if (!a.customData || !b.customData) return;

                if (a.customData.type !== 'static' && b.customData.type === 'static' && pair.collision.normal.y < 0) {
                    a.customData.grounded = true;
                }

                if (b.customData.type !== 'static' && a.customData.type === 'static' && pair.collision.normal.y > 0) {
                    b.customData.grounded = true;
                }
            });
        });

        Matter.Events.on(engine, 'collisionEnd', (event) => {
            event.pairs.forEach(pair => {
                const a = pair.bodyA;
                const b = pair.bodyB;

                if (!a.customData || !b.customData) return;

                if (a.customData.type !== 'static' && b.customData.type === 'static') {
                    a.customData.grounded = false;
                }

                if (b.customData.type !== 'static' && a.customData.type === 'static') {
                    b.customData.grounded = false;
                }
            });
        });
    }

    function checkCollision(a, b) {
        if (!a?.matterBody || !b?.matterBody) return false;
        const result = Matter.SAT.collides(a.matterBody, b.matterBody);
        if (result) return result.collided;
        return 
    }

    return {
        init,
        newBody,
        update,
        setGravity,
        getBodies: () => bodies,
        checkCollision
    };
})();
