/**
 * Created by blost on 27.11.14.
 */

$(document).ready(function(){
    $(function() {
        $('#leftNavigation').ssdVerticalNavigation();
    });

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

    $(function() {
        $('form.documentForm').submit(function(e) {

            e.preventDefault();
            var input_db = $('.documentForm input#_db').val();
            var input_id = $('.documentForm input#_id').val();
            var input_rev = $('.documentForm input#_rev').val();
            $.couch.db(input_db).openDoc(input_id, {
                success: function(couchDoc) {
                    $('.documentForm input#_rev').val(couchDoc._rev);
                    $('form.documentForm').ajaxSubmit({
                        url: "/"+ input_db +"/"+ input_id,
                        success: function(response) {
                            alert("Your attachment was submitted.")
                        }
                    })
                },
                error: function(status) {
                    $.couch.db(input_db).saveDoc({"_id":input_id}, {
                        success: function(couchDoc) {
                            $('.documentForm input#_rev').val(couchDoc.rev);
                            $('form.documentForm').ajaxSubmit({
                                url: "/"+ input_db +"/"+ input_id,
                                success: function(response) {
                                    alert("Your attachment was submitted.")
                                }
                            })
                        }
                    })
                }

            });
        });
    });

});