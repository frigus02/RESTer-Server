'use strict';

module.exports = function(req, res, next) {
    const originalRender = res.render.bind(res);
    res.render = function(template, locals) {
        originalRender('_layout', {
            locals,
            partials: {
                template
            }
        });
    };
    next();
};
