$(function() {
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    var path = unescape(document.location.pathname).split('/'),
        design = path[3],
        db = $.couch.db(path[1]);
    function drawItems() {
        db.view(design + "/recent-items", {
            descending : "true",
            limit : 50,
            update_seq : true,
            success : function(data) {
                setupChanges(data.update_seq);
                var them = $.mustache($("#recent-messages").html(), {
                    items : data.rows.map(function(r) {return r.value;})
                });
                $("#content").html(them);
            }
        });
    }
    drawItems();
    var changesRunning = false;
    function setupChanges(since) {
        if (!changesRunning) {
            var changeHandler = db.changes(since);
            changesRunning = true;
            changeHandler.onChange(drawItems);
        }
    }

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

    $.couchProfile.templates.profileReady = $("#new-message").html();
    $("#account").couchLogin({
        loggedIn : function(r) {
            $("#profile").couchProfile(r, {
                profileReady : function(profile) {
                    getAllQuestionnaires(function (questionnaires) {
                        addQuestionnairesToComboBox(questionnaires);
                    });
                    $('#create-message form.documentForm2').submit(function (e) {
                        e.preventDefault();
                        uploadImageFromForm('#create-message form.documentForm', function(){
                            uploadImageFromForm('#create-message form.documentForm2', function(){
                                var legSrc = $("form input#update_attachments")[0].files[0].name;
                                var hotDog = $("form input#update_attachments2")[0].files[0].name;
                                var id = $("select#questionnaires_in_dbs option:selected").attr('id');
                                var document = generateQuestionnaireDocument(id, userID, $('#update_title').val(), $('#update_description').val(), legSrc, hotDog, 0, 0);
                                expandDocument(questionnairesCollectionName, document);
                                alert("Your questionnaires was updated.");
                            })
                        });
                    });
                }
            });
        }, loggedOut : function() {
            $("#profile").html('<p>Please log in to edit your quizes.</p>');
        }
    });
 });

