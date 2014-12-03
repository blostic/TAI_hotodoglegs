/**
 * Created by blost on 27.11.14.
 */

$(document).ready(function () {

    var currentDatabase = 'testdb';
    var imagesDb = 'images';
    var userID = 'WerwNPKl';
    var currentQuestionnaire = "questionnaire_Test";
    var questionnairesCollectionName = "questionnaires";

    var addImage = function (src, slotId, imgId) {
        var imgSlot = $('<div></div>');
        imgSlot.attr('id', slotId);
        imgSlot.appendTo('#game-question');
        var img = $('<img/>');
        img.attr('id', imgId);
        img.attr('src', src);
        img.appendTo('#' + slotId);

        var submit = $('<button> Wybierz mnie!</button>');
        submit.attr('id', 'db' + imgId);
        submit.appendTo('#' + slotId);

    };

    // creating main page
    var createGamePage = function (questionnaire) {
        console.log(questionnaire)
        $('#game-question').empty();
        if (questionnaire['hotDogSrc'] && questionnaire['legSrc']) {
            if (Math.random() > 0.5) {
                addImage("../../images/" + questionnaire['hotDogSrc'], 'dynamic1', "dynamicImage1");
                addImage("../../images/" + questionnaire['legSrc'], 'dynamic2', "dynamicImage2");
            } else {
                addImage("../../images/" + questionnaire['legSrc'], 'dynamic2', "dynamicImage2");
                addImage("../../images/" + questionnaire['hotDogSrc'], 'dynamic1', "dynamicImage1");
            }
        }
    };

    //navigation
    var content = $("#contentRight  .content")
    $("#leftNavigation a").click(function () {
        var href = $(this).attr("href").split("#")[1];
        content.each(function () {
            $(this).addClass("inactive");
            $(this).removeClass("active");
            if ($(this).attr("id") == href) {
                $(this).removeClass("inactive");
                $(this).addClass("active");
            }
        });
    });

    //update document
    var updateDocument = function (dbs, oldDocumentName, newDocument) {
        $.couch.db(dbs).openDoc(oldDocumentName, {
            success: function (couchDoc) {
                var couchDocument = couchDoc;
                $.couch.db(dbs).removeDoc(couchDoc);
                newDocument["_id"] = couchDocument;
                $.couch.db(dbs).saveDoc(document, {
                    success: function () {
                        console.log("documentUpdated");
                    }
                });
            },
            error: function (status) {
                newDocument["_id"] = oldDocumentName;
                $.couch.db(dbs).saveDoc(newDocument, {
                    success: function (couchDoc) {
                        console.log("documentUpdated");
                    }
                })
            }
        });
    };

    var getPseudoUniqueID = function () {
        return Math.random().toString(36).slice(2);
    };

    var generateQuestionnaireDocument = function (authorId, title, description, legSrc, hotDogSrc, hot_dog_points, legs_points) {
        var newDocument = {};
        newDocument['_id'] = getPseudoUniqueID();
        newDocument['author'] = authorId;
        newDocument['title'] = title;
        newDocument['description'] = description;
        newDocument['legSrc'] = legSrc;
        newDocument['hotDogSrc'] = hotDogSrc;
        newDocument["hot_dog_points"] = hot_dog_points;
        newDocument["legs_points"] = legs_points;
        return newDocument;
    };

    // getting all questionnaires, deliver it to callback function and call it
    var getAllQuestionnaires = function (dbsName, questionnairesCollectionName, callback) {
        return $.couch.db(dbsName).openDoc(questionnairesCollectionName, {
            success: function (couchDoc) {
                var couchDocuments = {};
                for (var questionnaire_index in couchDoc) {
                    if (questionnaire_index.length > 4) {
                        couchDocuments[questionnaire_index] = couchDoc[questionnaire_index];
                    }
                }
                callback(couchDocuments)
//                console.log("changing documents");
            }, error: function (status) {
                console.log(status);
            }

        });
    };

    //expand document
    var expandDocument = function (dbsName, oldDocumentName, newDocument) {
        $.couch.db(dbsName).openDoc(oldDocumentName, {
            success: function (couchDoc) {
                var couchDocument = couchDoc;
                setTimeout(function () {
                    couchDocument[newDocument["_id"]] = newDocument;
                    $.couch.db(dbsName).saveDoc(couchDocument, {
                        success: function () {
                            console.log("documentExpanded");
                        }
                    });
                }, 500);
            },
            error: function (status) {
                var couchDocument = {};
                couchDocument["_id"] = oldDocumentName;
                couchDocument[newDocument["_id"]] = newDocument;
                $.couch.db(dbsName).saveDoc(couchDocument, {
                    success: function () {
                        console.log("documentExpanded");
                    }
                });
            }
        });
    };

    // submit new questionnaire
    $(function () {
        $('form.documentForm').submit(function (e) {
            e.preventDefault();
            $.couch.db(currentDatabase).openDoc(imagesDb, {
                success: function (couchDoc) {
                    $('.documentForm input#_rev').val(couchDoc._rev);
                    $('form.documentForm').ajaxSubmit({
                        url: "/" + currentDatabase + "/" + imagesDb,
                        success: function (response) {
                        }
                    });
                },
                error: function () {
                    $.couch.db(currentDatabase).saveDoc({"_id": imagesDb}, {
                        success: function (couchDoc) {
                            $('.documentForm input#_rev').val(couchDoc.rev);
                            $('form.documentForm').ajaxSubmit({
                                url: "/" + currentDatabase + "/" + imagesDb,
                                success: function (response) {
                                }
                            })
                        }
                    })
                }

            });

            setTimeout(function () {
                $.couch.db(currentDatabase).openDoc(imagesDb, {
                    success: function (couchDoc) {
                        $('.documentForm2 input#_rev2').val(couchDoc._rev);
                        $('form.documentForm2').ajaxSubmit({
                            url: "/" + currentDatabase + "/" + imagesDb,
                            success: function (response) {
                                alert("Your attachments was submitted.")
                            }
                        });
                    },
                    error: function (status) {
                        $.couch.db(currentDatabase).saveDoc({"_id": imagesDb}, {
                            success: function (couchDoc) {
                                $('.documentForm input#_rev2').val(couchDoc.rev);
                                $('form.documentForm2').ajaxSubmit({
                                    url: "/" + currentDatabase + "/" + imagesDb,
                                    success: function (response) {
                                        alert("Your attachments was submitted.")
                                    }
                                })
                            }
                        })
                    }

                });
            }, 1000);

            var document = generateQuestionnaireDocument(userID, $('#_title').val(), $('#_description').val(),
                $("form input#_attachments")[0].files[0].name, $("form input#_attachments2")[0].files[0].name, 0, 0);
            expandDocument(currentDatabase, questionnairesCollectionName, document);
        });
    });

    $(function () {
        $('#leftNavigation').ssdVerticalNavigation();
    });


    getAllQuestionnaires(currentDatabase, questionnairesCollectionName, function (questionnaires) {
        Math.floor((Math.random() * Object.keys.length))
        var randomIndex = Math.floor((Math.random() * Object.keys(questionnaires).length));
        createGamePage(questionnaires[Object.keys(questionnaires)[randomIndex]]);
    });


});