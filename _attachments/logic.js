$dbname = "dbtest";
$appname= "couch_tai_project";
$db = $.couch.db($dbname);

$("body").data =    { "tagSelected" : "NOTAG"
                , "idSelected" : 0
                , "docEdited" : ""
                , "tagsUsed"  : []
                , "textSearchString" : false
                , "titleSearchString" : false
                , "tagSelected" : false
                };
                
$.couch.app(function (app) {
        $("#addContent").evently("editContent", app);
        $("#addPage").evently("addPage", app);
        $("#tagListPage").evently("tagListPage", app);
        $("#tagListContent").evently("tagListContent", app);
        $("#titleListPage").evently("titleListPage", app);
        $("#titleListContent").evently("titleListContent", app);
        $("#editPage").evently("editPage", app);
        $("#editContent").evently("editContent", app);
});

function makeEmptyNote () {
        $.log("logic.js - makeEmptyNote");
        var emptynote = {"_id" :  ""
                , "_rev" : ""
                , "type" : "note"
                , "TextNote" : {"note" : {"title": ""
                        , "text" : ""
                        , "tags" : []
                }
                }
        };
        return emptynote;
};

function doStoreDocument(document) {
        $db.saveDoc(document, {
                async : false,
                success: function (data) {
                        $("body").data.docEdited = data.id;
        $.log("store - success" + data.id + " " +  data.rev);
                        //  $.mobile.changePage("#editPage", "slidedown", true, true);
                },
    error: function () {
        alert("Cannot save new document.");
    }
});
}

function doView (view, json, callback) {
        $.log("dbViewWithKey ");
        $.log(json);
        $db.view(($appname + "/" + view),
                XXmerge (json, {
                        async : false,
                        success: function (data) {
                                callback(data);
                        },
                        error: function () {
                                alert("Cannot find the document with id " + keyvalue);
                        }
    })
        );
}

function XXmerge(o, ob) {
        for (var z in ob) {
                if (ob.hasOwnProperty(z)) {
                        o[z] = ob[z];
                }
        }
        return o;
}

function doGetDoc (docid, callback) {
        $.log("doGetDoc " + docid);
        $db.openDoc (docid, {
                success: function (data) {
                        callback(data);
                },
                error: function () {
                        alert("Cannot find the document with id " + keyvalue);
    }
        });
}

function doDeleteDocument(document) {
        $db.removeDoc(document, {
                async : false,
    success: function (data) {
        $("body").data.docEdited = data.id;
        $.log("document deleted - success" + data.id + " " +  data.rev);
    },
    error: function () {
        alert("Cannot delete document.");
    }
});
}
