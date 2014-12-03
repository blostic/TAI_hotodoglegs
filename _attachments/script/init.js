/**
 * Created by blost on 27.11.14.
 */

$(document).ready(function () {

    var databaseName = 'testdb';
    var imagesDb = 'images';
    var userID = 'WerwNPKl';
    var questionnairesCollectionName = "questionnaires";

    var addImage = function (src, slotId, imgId, questionnaireID, isLeg) {
        var imgSlot = $('<div></div>');
        imgSlot.attr('id', slotId);
        imgSlot.appendTo('#game-question');
        var img = $('<img/>');
        img.attr('id', imgId);
        img.attr('src', src);
        img.appendTo('#' + slotId);

        var submitButton = $('<button> Wybierz mnie!</button>');
        submitButton.attr('id', 'db' + imgId);
        submitButton.appendTo('#' + slotId);
        submitButton.click(function(){
            console.log(questionnaireID);
            if (isLeg) {
                increasePoint(questionnaireID, isLeg);
            } else {
                increasePoint(questionnaireID, isLeg);
            }
        });
    };
    var increasePoint = function(questionnaireID, isLeg) {
        getAllQuestionnaires(function(questionnaires){
            if (isLeg) {
                questionnaires[questionnaireID].legs_points +=1;
            } else {
                questionnaires[questionnaireID].hot_dog_points +=1;
            }
            updateDocument(questionnairesCollectionName, questionnaires);
        });
    };

    // creating main page
    var createGamePage = function (questionnaire) {
        $('#game-question').empty();
        if (questionnaire['hotDogSrc'] && questionnaire['legSrc']) {
            var questionnaireID = questionnaire['_id'];
            var isLeg = Math.random() > 0.5;
            if (isLeg) {
                addImage("../../images/" + questionnaire['hotDogSrc'], 'dynamic1', "dynamicImage1", questionnaireID, isLeg);
                addImage("../../images/" + questionnaire['legSrc'], 'dynamic2', "dynamicImage2", questionnaireID, isLeg);
            } else {
                addImage("../../images/" + questionnaire['legSrc'], 'dynamic2', "dynamicImage2", questionnaireID, isLeg);
                addImage("../../images/" + questionnaire['hotDogSrc'], 'dynamic1', "dynamicImage1", questionnaireID, isLeg);
            }
        }
    };

    //navigation
    var content = $("#contentRight").find(".content");
    $("#leftNavigation").find("a").click(function () {
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
    var updateDocument = function (oldDocumentName, newDocument) {
        $.couch.db(databaseName).openDoc(oldDocumentName, {
            success: function (couchDoc) {
                $.couch.db(databaseName).removeDoc(couchDoc, {
                    success: function(couchDoc) {
                        newDocument["_id"] = questionnairesCollectionName;
                        $.couch.db(databaseName).saveDoc(newDocument, {
                            success: function () {
                                console.log("documentUpdated");
                            },
                            error : function (status) {
                                console.log(status);
                            }

                        });
                    },
                    error : function(status){
                        console.log(status);
                    }
                });
            },
            error: function (status) {
                newDocument["_id"] = oldDocumentName;
                $.couch.db(databaseName).saveDoc(newDocument, {
                    success: function (couchDoc) {
                        console.log("documentUpdated");
                    },
                    error: function(status) {
                        console.log(status);
                    }
                })
            }
        });
    };

    var getPseudoUniqueID = function () {
        return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
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
    var getAllQuestionnaires = function (callback) {
        return $.couch.db(databaseName).openDoc(questionnairesCollectionName, {
            success: function (couchDoc) {
                var couchDocuments = {};
                for (var questionnaire_index in couchDoc) {
                    if (questionnaire_index.length > 4) {
                        couchDocuments[questionnaire_index] = couchDoc[questionnaire_index];
                    }
                }
                callback(couchDocuments);
            }, error: function (status) {
                console.log(status);
            }

        });
    };

    //expand document
    var expandDocument = function (oldDocumentName, newDocument) {
        $.couch.db(databaseName).openDoc(oldDocumentName, {
            success: function (couchDoc) {
                var couchDocument = couchDoc;
                setTimeout(function () {
                    couchDocument[newDocument["_id"]] = newDocument;
                    $.couch.db(databaseName).saveDoc(couchDocument, {
                        success: function () {
                            console.log("documentExpanded");
                        }
                    });
                }, 500);
            },
            error: function () {
                var couchDocument = {};
                couchDocument["_id"] = oldDocumentName;
                couchDocument[newDocument["_id"]] = newDocument;
                $.couch.db(databaseName).saveDoc(couchDocument, {
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
            $.couch.db(databaseName).openDoc(imagesDb, {
                success: function (couchDoc) {
                    $('.documentForm input#_rev').val(couchDoc._rev);
                    $('form.documentForm').ajaxSubmit({
                        url: "/" + databaseName + "/" + imagesDb,
                        success: function (response) {
                        }
                    });
                },
                error: function () {
                    $.couch.db(databaseName).saveDoc({"_id": imagesDb}, {
                        success: function (couchDoc) {
                            $('.documentForm input#_rev').val(couchDoc.rev);
                            $('form.documentForm').ajaxSubmit({
                                url: "/" + databaseName + "/" + imagesDb,
                                success: function (response) {
                                }
                            })
                        }
                    })
                }

            });

            setTimeout(function () {
                $.couch.db(databaseName).openDoc(imagesDb, {
                    success: function (couchDoc) {
                        $('.documentForm2 input#_rev2').val(couchDoc._rev);
                        $('form.documentForm2').ajaxSubmit({
                            url: "/" + databaseName + "/" + imagesDb,
                            success: function () {
                                alert("Your attachments was submitted.")
                            }
                        });
                    },
                    error: function (status) {
                        $.couch.db(databaseName).saveDoc({"_id": imagesDb}, {
                            success: function (couchDoc) {
                                $('.documentForm input#_rev2').val(couchDoc.rev);
                                $('form.documentForm2').ajaxSubmit({
                                    url: "/" + databaseName + "/" + imagesDb,
                                    success: function () {
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
            expandDocument(questionnairesCollectionName, document);
        });
    });

    $(function () {
        $('#leftNavigation').ssdVerticalNavigation();
    });

    getAllQuestionnaires(function (questionnaires) {
        Math.floor((Math.random() * Object.keys.length));
        var randomIndex = Math.floor((Math.random() * Object.keys(questionnaires).length));
        createGamePage(questionnaires[Object.keys(questionnaires)[randomIndex]]);
    });

});