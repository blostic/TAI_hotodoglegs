function couchapp_load(scripts) {
    for (var i=0; i < scripts.length; i++) {
        document.write('<script src="'+scripts[i]+'"><\/script>')
    };
};

couchapp_load([
    "/_utils/script/sha1.js",
    "/_utils/script/json2.js",
    "/_utils/script/jquery.js",

    "vendor/couchapp/jquery-1.6.2.min.js",

    "vendor/couchapp/jquery.couch.js",
    "vendor/couchapp/jquery.couch.app.js",
    "vendor/couchapp/jquery.couch.app.util.js",

    "vendor/couchapp/jquery.pathbinder.js",
    "vendor/couchapp/jquery.mustache.js",
    "vendor/couchapp/jquery.evently.js",

    "vendor/couchapp/jquery-ui-1.8.17.custom.min.js",
    "vendor/couchapp/jquery.mobile-1.0.min.js"
]);
