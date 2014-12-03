/**
 * Created by blost on 27.11.14.
 */

$(document).ready(function(){

    var currentDatabase = 'testdb';
    var imagesDb = 'images';
    var userID = 'WerwNPKl';

    var addImage  = function(src, slotId, imgId){
        var imgSlot = $('<div></div>');
        imgSlot.attr('id', slotId);
        imgSlot.appendTo('#game-question');
        var img = $('<img/>');
        img.attr('id', imgId);
        img.attr('src', src);
        img.appendTo('#' + slotId);

        var submit = $('<button> Wybierz mnie!</button>');
        submit.attr('id','db' + imgId);
        submit.appendTo('#' + slotId);

    };

    $(function() {
        $('#leftNavigation').ssdVerticalNavigation();
    });
    $(function() {
        addImage("image/hot1.jpg", 'dynamic1', "dynamicImage1");
        addImage("image/hot2.jpg", 'dynamic2', "dynamicImage2");
    });

    //navigation
    var content = $("#contentRight  .content")
    $("#leftNavigation a").click(function(){
        var href = $(this).attr("href").split("#")[1];
        content.each(function(){
            $(this).addClass("inactive");
            $(this).removeClass("active");
            if($(this).attr("id") == href) {
                $(this).removeClass("inactive");
                $(this).addClass("active");
            }
        });
    });

    // document upload
    $(function() {
        $('form.documentForm').submit(function (e) {
            e.preventDefault();
            $.couch.db(currentDatabase).openDoc(imagesDb, {
                success: function (couchDoc) {
                    $('.documentForm input#_rev').val(couchDoc._rev);
                    $('form.documentForm').ajaxSubmit({
                        url: "/" + currentDatabase + "/" + imagesDb,
                        success: function (response) {
//                            alert("Your attachment was submitted.")
                        }
                    });
                },
                error: function (status) {
                    $.couch.db(currentDatabase).saveDoc({"_id": imagesDb}, {
                            success: function (couchDoc) {
                            $('.documentForm input#_rev').val(couchDoc.rev);
                            $('form.documentForm').ajaxSubmit({
                                url: "/" + currentDatabase + "/" + imagesDb,
                                success: function (response) {
//                                    alert("Your attachment was submitted.")
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

//            $.couch.db(currentDatabase).openDoc("questionnaires", {
//               success: function(){
//
//               },
//                error: function(){
//
//                }
//            });

            var title = $('#_title').val();
            var query = "questionnaire_" + title;
            $.couch.db(currentDatabase).saveDoc(
                {
                    "_id": query,
                    "title": $('#_title').val(),
                    "description": $('#_description').val(),
                    "hot_dog_image_filename" : $("form input#_attachments")[0].files[0].name,
                    "legs_image_filename": $("form input#_attachments2")[0].files[0].name,
                    "hot_dog_points" : 0,
                    "legs_points" : 0
                });
            });
    });
});