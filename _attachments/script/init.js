/**
 * Created by blost on 27.11.14.
 */

var databaseName = 'testdb';
var imagesCollectionName = 'images';
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
    submitButton.click(function () {
        increasePoint(questionnaireID, isLeg, displayResults);

        $("#game-question").find("button").each(function () {
            $(this).attr('disabled', 'disabled');
        });

        setTimeout(function () {
            getAllQuestionnaires(function (questionnaires) {
                Math.floor((Math.random() * Object.keys.length));
                var randomIndex = Math.floor((Math.random() * Object.keys(questionnaires).length));
                $("#current_score").empty();
                createGamePage(questionnaires[Object.keys(questionnaires)[randomIndex]]);
            });
        }, 2000);
    });
};

var increasePoint = function (questionnaireID, isLeg, callback) {
    getAllQuestionnaires(function (questionnaires) {
        if (isLeg) {
            questionnaires[questionnaireID].legs_points += 1;
            var pointsElement = $("#points");
            var points = parseInt(pointsElement.text());
            points += 1;
            pointsElement.text(points.toString());
        } else {
            questionnaires[questionnaireID].hot_dog_points += 1;
        }
        updateDocument(questionnairesCollectionName, questionnaires);
        callback(questionnaires[questionnaireID], isLeg);
    });
};

var displayResults = function (questionnaire) {
    $("#leg-points").text(questionnaire.legs_points.toString());
    $("#hot-dog-points").text(questionnaire.hot_dog_points.toString());
};

var addResultBox = function (hotDogFirst) {
    var imgSlot1 = $('<div></div>');
    var imgSlot2 = $('<div></div>');

    imgSlot1.attr('id', "leg-points");
    imgSlot2.attr('id', "hot-dog-points");

    if (!hotDogFirst) {
        imgSlot1.appendTo('#current_score');
        imgSlot2.appendTo('#current_score');
    } else {
        imgSlot2.appendTo('#current_score');
        imgSlot1.appendTo('#current_score');
    }
};

var addQuestionnairesToComboBox = function (questionnaires) {
    var comboBox = $('#questionnaires_in_dbs');
    for (questionnaire in questionnaires) {
        var select = $('<option>' + questionnaires[questionnaire].title + '</option>');
        select.attr('id',  questionnaires[questionnaire]._id);
        select.attr('value', questionnaires[questionnaire].title);
        select.appendTo(comboBox);
    }
    comboBox.change(function(){
        $( "select#questionnaires_in_dbs option:selected" ).each(function() {
            console.log($(this).attr('id'));
            var selected = questionnaires[$(this).attr('id')];
            $("#update_title").val(selected['title']);
            $("#update_description").val(selected['description']);
        });
    });
};


// creating main page
var createGamePage = function (questionnaire) {
    $('#game-question').empty();
    if (questionnaire['hotDogSrc'] && questionnaire['legSrc']) {
        var questionnaireID = questionnaire['_id'];
        $("#questionnaire-title").text(questionnaire['title']);
        var isLegOnTheRight = Math.random() > 0.5;
        if (isLegOnTheRight) {
            addImage("../../images/" + questionnaire['hotDogSrc'], 'dynamic1', "dynamicImage1", questionnaireID, false);
            addImage("../../images/" + questionnaire['legSrc'], 'dynamic2', "dynamicImage2", questionnaireID, true);
            addResultBox(true);
        } else {
            addImage("../../images/" + questionnaire['legSrc'], 'dynamic2', "dynamicImage2", questionnaireID, true);
            addImage("../../images/" + questionnaire['hotDogSrc'], 'dynamic1', "dynamicImage1", questionnaireID, false);
            addResultBox(false);
        }
    }
};

//update document
var updateDocument = function (oldDocumentName, newDocument) {
    $.couch.db(databaseName).openDoc(oldDocumentName, {
        success: function (couchDoc) {
            $.couch.db(databaseName).removeDoc(couchDoc, {
                success: function () {
                    newDocument["_id"] = questionnairesCollectionName;
                    $.couch.db(databaseName).saveDoc(newDocument, {
                        success: function () {
                            console.log("documentUpdated");
                        }, error: function (status) {
                            console.log(status);
                        }
                    });
                }, error: function (status) {
                    console.log(status);
                }
            });
        }, error: function () {
            newDocument["_id"] = oldDocumentName;
            $.couch.db(databaseName).saveDoc(newDocument, {
                success: function () {
                    console.log("documentUpdated");
                }, error: function (status) {
                    console.log(status);
                }
            })
        }
    });
};

var getPseudoUniqueID = function () {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

var generateQuestionnaireDocument = function (id, authorId, title, description, legSrc, hotDogSrc, hot_dog_points, legs_points) {
    var newDocument = {};
    newDocument['_id'] = id;
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
    $.couch.db(databaseName).openDoc(questionnairesCollectionName, {
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
            couchDoc[newDocument["_id"]] = newDocument;
            $.couch.db(databaseName).saveDoc(couchDoc, {
                success: function () {
                    console.log("documentExpanded");
                }
            });
        }, error: function () {
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

var uploadImageFromForm = function(form, callback){
    $.couch.db(databaseName).openDoc(imagesCollectionName, {
        success: function (couchDoc) {
            $(form + ' input._rev').val(couchDoc._rev);
            $(form).ajaxSubmit({
                url: "/" + databaseName + "/" + imagesCollectionName,
                success: function () { callback() }
            })
        }, error: function () {
            $.couch.db(databaseName).saveDoc({"_id": imagesCollectionName}, {
                success: function (couchDoc) {
                    $(form + ' input._rev').val(couchDoc.rev);
                    $(form).ajaxSubmit({
                        url: "/" + databaseName + "/" + imagesCollectionName,
                        success: function () { callback() }
                    })
                }
            })
        }
    });
};

$(document).ready(function () {

    $('#leftNavigation').ssdVerticalNavigation();

    getAllQuestionnaires(function (questionnaires) {
        var randomIndex = Math.floor((Math.random() * Object.keys(questionnaires).length));
        createGamePage(questionnaires[Object.keys(questionnaires)[randomIndex]]);
    });

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

    $('#dice').bind("click", function () {
        getAllQuestionnaires(function (questionnaires) {
            $("#current_score").empty();
            var randomIndex = Math.floor((Math.random() * Object.keys(questionnaires).length));
            createGamePage(questionnaires[Object.keys(questionnaires)[randomIndex]]);
        });
    });

    // submit new questionnaire
    $('#new-game form.documentForm2').submit(function (e) {
        e.preventDefault();
        uploadImageFromForm('#new-game form.documentForm', function(){
            uploadImageFromForm('#new-game form.documentForm2', function(){
                var legSrc = $("form input#_attachments")[0].files[0].name;
                var hotDog = $("form input#_attachments2")[0].files[0].name;
                var document = generateQuestionnaireDocument(getPseudoUniqueID(), userID, $('#_title').val(), $('#_description').val(), legSrc, hotDog, 0, 0);
                expandDocument(questionnairesCollectionName, document);
                alert("Your questionnaires was submitted.");
            })
        });
    });

});