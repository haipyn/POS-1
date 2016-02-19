/**
 * Created by Jean on 2016-01-01.
 */


var pageScroll = false;
setTimeout(function() { pageScroll.resize(); }, 500);

$('#contentPanel').hide(0);
$('#contentPanel').css('visibility', 'visible');

$('#contentPanel').show(200);

$('.datepickerInput').datepicker({
    format: 'yyyy-mm-dd',
    startDate: '-3d'
});


var tableItaration = 1;


while(document.getElementById('tableChoiceList'+tableItaration) !=null){


    var sumbitOneAction = $('.choiceList'+tableItaration+'.sumbit-one.action');

    sumbitOneActionClick(sumbitOneAction, tableItaration);

    var currentTableChoiceList = $('#tableChoiceList'+tableItaration);
    var currentTableChoiceListArrow = $('#tableChoiceListArrow'+tableItaration);
    var currentTableChoiceActive = $('.tableChoice.choiceList'+tableItaration+'.active');
    var allCurrentTableChoice = $('.tableChoice.choiceList'+tableItaration);

    currentTableChoiceList.slideUp(0);
    currentTableChoiceList.css('visibility', 'visible');
    currentTableChoiceList.slideDown(500);


    var currentTableChoiceAddNew = $('.choiceList'+tableItaration+'.add-new');
    currentTableChoiceAddNew.hide(0);

    var currentTableChoiceFocus = $('.tableChoice.choiceList'+tableItaration+'.focus');

    currentTableChoiceAdd(currentTableChoiceFocus, tableItaration);


    arrowClick(currentTableChoiceList, currentTableChoiceListArrow, tableItaration);

    choiceClick(allCurrentTableChoice, tableItaration);

    currentTableChoiceList.prepend(currentTableChoiceActive);

    tableItaration++;
}


function sumbitOneActionClick(sumbitOneAction, tableItaration){
    sumbitOneAction.click(function(){
        var currentTableChoiceActive = $('.tableChoice.choiceList'+tableItaration+'.active');

        //We store inpout here

        var newItem1 = $('#newItemValue1')
        var newItem2 = $('#newItemValue2')

        var newItemName1 = newItem1.getAttribute('name');
        var newItemName2 = newItem2.getAttribute('name');;

        var newItemValue1 = newItem1.getAttribute('value');
        var newItemValue2 = newItem2.getAttribute('value');;


        currentTableChoiceActive.children().fadeOut(200).promise().then(function() {

            currentTableChoiceActive.empty();
        });
/*
        newItem2.ajax*/


        //we display new input now, fadein
    });


}

function currentTableChoiceAdd(currentTableChoiceFocus, tableItaration){
    currentTableChoiceFocus.click(function(){

        var currentTableChoiceFocus = $('.tableChoice.choiceList'+tableItaration+'.focus');


        currentTableChoiceFocus.children().fadeOut(200).promise().then(function() {
            /*currentTableChoiceFocus.empty();*/
            /*var currentTableChoiceAddOne = $('.choiceList'+tableItaration+'.add-one');
            currentTableChoiceAddOne.remove();*/

            var currentTableChoiceAddNew = $('.choiceList'+tableItaration+'.add-new');

            currentTableChoiceFocus.removeClass("focus");
            currentTableChoiceAddNew.fadeIn(200);
        });



    });

}


function choiceClick(allCurrentTableChoice, tableItaration){
    allCurrentTableChoice.click(function(){

        var currentTableChoiceActive = $('.tableChoice.choiceList'+tableItaration+'.active');

        currentTableChoiceActive.removeClass("active");

        this.className = this.className + " active";

        $('.input'+tableItaration).attr("value", this.id);

    });

}


function arrowClick(currentTableChoiceList, currentTableChoiceListArrow, tableItaration){
    currentTableChoiceListArrow.click(function() {


        var currentTableChoiceActive = $('.tableChoice.choiceList'+tableItaration+'.active');


        if(currentTableChoiceListArrow.html() == '<span class="glyphicon glyphicon-chevron-down"></span>'){
            autoHeightAnimate(currentTableChoiceList, 300);

            setTimeout(function() { pageScroll.resize(); }, 300);

            currentTableChoiceListArrow.html('<span class="glyphicon glyphicon-chevron-up"></span>');

        }else{

            currentTableChoiceActive.slideUp(150);


            setTimeout(function() {currentTableChoiceList.prepend(currentTableChoiceActive); }, 200);

            currentTableChoiceActive.slideDown(150);


            currentTableChoiceList.animate({height: 80 }, 300);
            pageScroll.resize();
            currentTableChoiceListArrow.html('<span class="glyphicon glyphicon-chevron-down"></span>');
        }
    });

}




/*
$('.tableChoiceListArrow').onmouseover(function(){

});*/

/* Function to animate height: auto */
function autoHeightAnimate(element, time){
    var curHeight = element.height(), // Get Default Height
        autoHeight = element.css('height', 'auto').height(); // Get Auto Height
    element.height(curHeight); // Reset to Default Height
    element.stop().animate({ height: autoHeight }, parseInt(time)); // Animate to Auto Height
}



$(document).ready(

    function() {

        pageScroll = $("html").niceScroll({cursorcolor:"#30a5ff", cursorborderradius:"2px", cursorwidth:"8px"});

    }

);
