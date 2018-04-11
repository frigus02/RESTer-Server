'use strict';

module.exports = function(res, template, locals) {
    res.render('_layout', {
        locals,
        partials: {
            template
        }
    });
};
