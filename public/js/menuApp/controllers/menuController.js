angular.module('starter.controllers')
    .controller('menuController', function ($scope, getReq, postReq, $log, $filter, $timeout, Idle) {

        /*Initializing variables*/
        $scope.commandItems = [];
        //
        var $planSection = $('#planModal');
        var $planPanzoom = $planSection.find('.panzoom').panzoom({$reset: $planSection.find("#planZoomout")});  // Initialize the panzoom
        var planZoomout = $('#planZoomout');
        var increment = 0.5; // Incrementation for the zoom in
        $scope.totalIncrement = 1; // Value for the zoom status
        //
        var planBiggerX = 0; //Best result for X inside plan wallpoints
        var planBiggerY = 0; //Best result for Y inside plan wallpoints
        var planXProportion = 0; // X Proportion missing to fill the page horizontaly with the plan
        var planYProportion = 0; // Y Proportion missing to fill the page verticaly with the plan
        var planWallPoints; //Double tokenized string caintaining the wallpoints
        var planTableWidth = 95.8 * 0.8;
        var planTableHeight = 45.8 * 0.8;
        //
        $scope.filters = {};
        //
        $scope.menuFilters = {};
        //
        $scope.menuItemTypes = [];
        //Pannel 100%/100% to block the user if no employee is authenticated
        var windowModalBlockerHtml = '<div id="windowModalBlocker" class="pg-loading-screen pg-loading" style=" background-color: #222; opacity:1; width: 100%; height: 100%; position: absolute; z-index: -1;">' +
            '<div class="pg-loading-inner">' +
            '<div class="pg-loading-center-outer">' +
            '<div style="padding-bottom:140px;vertical-align: bottom" class="pg-loading-center-middle">' +
            '<img class="pg-loading-logo" src="http://pos.mirageflow.com/Framework/please-wait/posio.png">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        //
        $scope.totalBill = 0; // Current command total (subtotal + taxes)
        //
        $scope.noteSuggestions = ['Sans gluten', 'Ne pas faire', 'OPC']; //Suggestions when adding not to an item inside a command
        //
        $scope.taxes = [{value: 0.05, total: 0, name: 'TPS'}, {value: 0.09975, total: 0, name: 'TVQ'}] // Current command taxes
        //
        var timeoutHandle; //On finish will normaly execute a function that update the current table'commands' - To avoid request overcharge
        var billTimeoutHandle; // Same thing but for the bills
        var pendingRequestAuthRequest;
        //Msg on employee auth panel
        var msgEnterEmployeeNumber = "Entrez votre numéro d'employé";
        var msgEnterEmployeePassword = "Entrez votre mot de passe";
        $scope.mainText = ""; //Current msg on employee auth panel
        //Boolean toggle for displaying multiple panels
        $scope.showBillWindow = false;
        $scope.showEmployeeModal = false;
        $scope.showTableModal = false;
        $scope.showPlanModal = false;
        $scope.showDivideBillModal = false;
        $scope.showHeaderOptions = true;
        $scope.showBillDemo = false;
        $scope.showPanelOverwriteBill = false;
        $scope.showPayBillPanel = false;
        //
        $scope.paymentCurrentStep = '';
        //
        $scope.noteDynamicPopover = {
            content: '',
            templateUrl: 'notePopover.html',
            title: 'Notes sur la commande'
        }; //Popover when adding note to an item inside a command

        //Configuration for the noteDynamicPopover
        $scope.placement = {
            options: [
                'top',
                'top-left',
                'top-right',
                'bottom',
                'bottom-left',
                'bottom-right',
                'left',
                'left-top',
                'left-bottom',
                'right',
                'right-top',
                'right-bottom'
            ],
            selected: 'bottom-right',
            selectedBottom: 'top-right'
        };
        //
        $scope.clientPagerMaxSize = 3; //This represent the number of page number to display in the middle of the client pager
        $scope.clientPagerTotalItems = 10; // Total de page du client pager sous forme unitaire
        $scope.commandCurrentClient = 1; // Current client page
        //
        $scope.commandClient = []; // Array containing the list of command for the current table
        $scope.commandClient[$scope.commandCurrentClient] = {};
        $scope.commandClient[$scope.commandCurrentClient].commandItems = [];  // Array containing the list of item for the command
        //
        $scope.bills = null;
        //$scope.bills[0] = [];
        $scope.movingBillItem = false; //Flag to display the move item button on bill page
        //
        $scope.currentEmploye = {}; //Current employee authenticated
        //
        $scope.savingMessage = "Pret!"; //Loading bar message
        //
        $scope.terminateCommandInfo = [];
        //
        var elem = document.body; // Used to go fullscreen.
        var fullscreenFlag = false;
        var splashFullScreen = $('#splashFullScreen');
        /*Box to inform you that you are now in fullscreen*/
        //
        var billWindow = $('#billWindow');
        //
        var modalChangeEmployee = $('#changeEmployee');
        //
        var mainText = $('#mainText');
        /*End of Initializing variables*/

        /*When the user become idle*/
        $scope.$on('IdleStart', function () {
            console.log('Idle');
            if (!$scope.showEmployeeModal) {
                $scope.changeEmployee();
            }
            pendingRequestAuthRequest = null;
        });


        /*User in idle before been kicked*/
        $scope.$on('IdleWarn', function (e, countdown) {
            if (countdown == 1) {
                console.log('End if idle to trigger')
            }
        });


        /*User idle has timeout, he is kicked*/
        $scope.$on('IdleTimeout', function () {
            console.log('IdleTimeout');
            $scope.commandClient = [];
            $scope.commandItems = [];
            /*$scope.bills = [];
             $scope.taxe = [0, 0];
             $scope.totalBill = 0;*/
            $(windowModalBlockerHtml).hide().prependTo(modalChangeEmployee).fadeIn("fast");

            modalChangeEmployee.find('#closeModal').hide();

            Idle.watch();
        });

        /*Function to delete an item from the current command*/
        $scope.delete2 = function (item) {
            $scope.commandClient[$scope.commandCurrentClient].commandItems.splice($scope.commandClient[$scope.commandCurrentClient].commandItems.indexOf(item), 1);
            $scope.updateCommand();
        };

        /*Function to increse quantity of an item from the current command*/
        $scope.increase = function (item) {
            item.quantity = item.quantity + 1;
            $scope.updateCommand();

        };

        /*Function to decrease quantity of an item from the current command*/
        $scope.decrease = function (item) {
            if (item.quantity > 0) {
                item.quantity = item.quantity - 1;
                $scope.updateCommand();
            }
        };

        /*Function to get the plan from database then display it*/
        $scope.getPlan = function () {
            console.log('GetPlan');
            $url = 'http://pos.mirageflow.com/api/table-plan/1';

            /*What to do with the plan received*/
            var $callbackFunction = function (response) {

                var floor = 0;

                if (typeof $scope.plan != "undefined" && $scope.plan != null)
                    floor = $scope.plan.currentFloor;

                $scope.plan = response;

                $scope.plan.currentFloor = floor;

                if (typeof $scope.currentTable == 'undefined' || $scope.currentTable == null)
                    $scope.currentTable = $scope.plan.table[0];

                $scope.planCanva();


            };
            getReq.send($url, null, $callbackFunction);
        };
        $scope.getPlan();

        /*Increase the floor level in the plan*/
        $scope.floorUp = function () {
            $scope.plan.currentFloor++;
            $scope.planCanva();
        };

        /*Decrease the floor level in the plan*/
        $scope.floorDown = function () {
            $scope.plan.currentFloor--;
            $scope.planCanva();
        };

        /*Reset zoom status in the plan*/
        $planSection.find("#planZoomout").on('click', function () {
            $scope.totalIncrement = 1;
        });

        /*This is the listener for zoooming inside the plan, on double click*/
        (function () {
            $planPanzoom.parent().on('dblclick', function (e) {
                e.preventDefault();

                var offset = this.getClientRects()[0];

                /*Fix the margin error*/
                var eWithOffset = e;
                eWithOffset.clientX = (e.clientX - offset.left);
                eWithOffset.clientY = (e.clientY - offset.top) - 300;

                console.log(eWithOffset);

                $planPanzoom.panzoom('zoom', false, {
                    increment: increment,
                    focal: eWithOffset
                });

                /*Allow click to work by following the zoom effect on the Div*/
                $scope.totalIncrement += increment;
            });
        })();

        /*Will ultimatetly render the plan*/
        $scope.planCanva = function () {
            var planModal = $('#planModal');
            var canvas = $('#planCanvas');
            canvas.remove();
            planModal.find('.panzoom').append('<canvas style="margin: 0;" id="planCanvas" width="0" height="0" />');
            canvas = $('#planCanvas');

            /*50 is the menu header*/
            var canvasWidth = window.innerWidth;
            var canvasHeight = window.innerHeight - 51;

            planModal.attr('width', canvasWidth);
            planModal.attr('height', canvasHeight);


            canvas.attr('width', canvasWidth);
            canvas.attr('height', canvasHeight);

            var elem = document.getElementById('planCanvas'),
                context = elem.getContext('2d'),
                elements = [];

            context.clearRect(0, 0, canvas.width, canvas.height);
            elements = [];

            // Add event listener for `click` events.
            elem.addEventListener('click', function (event) {

                var offset = this.getClientRects()[0];

                var x = (event.clientX - offset.left),
                    y = (event.clientY - offset.top);

                /*Adjust with the zoom*/
                x /= $scope.totalIncrement;
                y /= $scope.totalIncrement;


                elements.forEach(function (element) {
                    var top = element.top,
                        left = element.left,
                        height = element.height,
                        width = element.width,
                        angle = element.angle;

                    /*Rotation begin*/
                    var originX = left + width / 2,
                        originY = top + height / 2;
                    // translate mouse point values to origin
                    var dx = x - originX, dy = y - originY;
                    // distance between the point and the center of the rectangle
                    var h1 = Math.sqrt(dx * dx + dy * dy);
                    var currA = Math.atan2(dy, dx);
                    // Angle of point rotated around origin of rectangle in opposition
                    var newA = currA - angle; //45 rad here
                    // New position of mouse point when rotated
                    var x2 = Math.cos(newA) * h1;
                    var y2 = Math.sin(newA) * h1;
                    /*Rotation end*/

                    // Check relative to center of rectangle after rotation
                    if (x2 > -0.5 * width && x2 < 0.5 * width && y2 > -0.5 * height && y2 < 0.5 * height) {
                        console.log('Clicked table : ' + element.name);

                        var selectedTable = $filter("filter")($scope.plan.table, {id: element.id});

                        $scope.changeTable(selectedTable[0]);
                        $scope.showPlanModal = false;
                    }
                });

            }, false);

            planBiggerX = 0;
            planBiggerY = 0;
            planXProportion = 0;
            planYProportion = 0;
            planWallPoints = $scope.plan.wallPoints;
            var onePoint = planWallPoints.split(",");
            if (onePoint != "") {

                for (var m = 0; m < onePoint.length; m++) {
                    var coordonate = onePoint[m].split(":");

                    var x1 = parseInt(coordonate[0]);
                    var y1 = parseInt(coordonate[1]);

                    if (x1 > planBiggerX) {
                        planBiggerX = x1;
                    }

                    if (y1 > planBiggerY) {
                        planBiggerY = y1;
                    }
                }

                // 99 for small margin
                planXProportion = 0.99 / (planBiggerX / canvas.attr('width'));
                planYProportion = 0.99 / (planBiggerY / canvas.attr('height'));
                /*xProportion =  1;
                 yProportion = 1;*/

                context.beginPath();
                context.strokeStyle = "#222";
                context.lineWidth = 8;
                context.lineJoin = 'round';
                for (m = 0; m < onePoint.length; m++) {
                    coordonate = onePoint[m].split(":");

                    x1 = parseInt(coordonate[0]);
                    y1 = parseInt(coordonate[1]);

                    if (x1 > planTableWidth / 2) {
                        x1 -= planTableWidth / 2;
                    }
                    x1 *= planXProportion;
                    y1 *= planYProportion;


                    if (m == 0)
                        context.moveTo(x1, y1);
                    else
                        context.lineTo(x1, y1);
                }
                context.closePath();
                context.fillStyle = '#444';
                context.fill();
                context.stroke();
                context.clip();

            }


            /*For each table inside the plan we push an element inside an array of canvas object*/
            /*We can evaluate table variable here*/
            for (var i = 0; i < $scope.plan.table.length; i++) {

                if ($scope.plan.table[i].noFloor == $scope.plan.currentFloor) {
                    /*0.6 is a base reducer*/
                    var width = planTableWidth * planXProportion;
                    var height = planTableHeight * planYProportion;
                    var angle = parseFloat($scope.plan.table[i].angle.substring(0, 4));
                    var color = '#00a5ff';

                    if ($scope.plan.table[i].status == 2)
                        color = '#EC0033'
                    if ($scope.plan.table[i].status == 3)
                        color = '#8ad919'

                    if ($scope.plan.table[i].type == "plc")
                        width = height;

                    // Add element.
                    elements.push({
                        id: $scope.plan.table[i].id,
                        name: $scope.plan.table[i].tblNumber,
                        type: $scope.plan.table[i].type,
                        status: $scope.plan.table[i].status,
                        angle: angle, /*
                         angle : 90,*/
                        colour: color,
                        width: width,
                        height: height,
                        top: parseInt($scope.plan.table[i].yPos) * planYProportion + height / 2,
                        left: parseInt($scope.plan.table[i].xPos) * planXProportion
                    });
                }
            }


            // Render elements.
            elements.forEach(function (element) {
                context.save();
                context.beginPath();
                context.fillStyle = element.colour;

                /*This represent the onClick listener detection*/
                //context.strokeStyle="red";
                //context.strokeRect(element.left,  element.top, width, height);
                /*End of - This represent the onClick listener detection*/

                /*This next part is to be able to rotate the rectangle using the corner only when needed*/
                var angle = Math.abs(element.angle);
                if (angle >= 3.12) {
                    angle -= 3.12;
                }
                if (angle >= 1.5) {
                    var curHeight = element.height;
                    if (angle >= 2.15) {
                        curHeight /= 2;
                    }
                    context.translate(element.left + element.height / 2, element.top + curHeight);
                } else {
                    context.translate(element.left + element.width / 2, element.top + element.height / 2);
                }

                context.rotate(element.angle);
                context.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);

                /*A little suplement*/
                paint_centered(document.getElementById('planCanvas'), -element.width / 2, -element.height / 2, element.width, element.height, element.name, element.angle);
                context.restore();
            });


        };

        /*Start loading element*/
        var $url = 'http://pos.mirageflow.com/itemtypes/list';
        var $callbackFunction = function (response) {

            console.log("Itemtype list received inside response");

            $scope.menuItemTypes = response;


            $url = 'http://pos.mirageflow.com/items/liste';
            var $callbackFunction = function (response) {

                console.log("Item list received inside response");

                $scope.menuItems = response;


                $scope.menuItemsExtended = [];

                for (var i = 0; i < $scope.menuItemTypes.length; i++) {
                    /*
                     console.log($scope.menuItemTypes[i].type);*/

                    $scope.menuItemsExtended[i] = $filter("filter")($scope.menuItems, {itemtype: {type: $scope.menuItemTypes[i].type}});


                    var size_name_array_now = $scope.menuItemTypes[i].size_names.split(",");

                    var size_array = [];


                    var sizeMainColor = [];


                    for (var x = 0; x < size_name_array_now.length; x++) {

                        size_array[x] = {};


                        var sizeColorForName = [15, 15, 15, 15, 15, 15];


                        var sizeColorText = [0, 0, 0, 0, 0, 0];


                        function getRandomColor(string) {
                            var letters = '0123456789ABCDEF'.split('');
                            var color = '#';
                            var textColor = '#';

                            var name = string.split('');

                            var count = 0;
                            for (var k = 0; k < name.length; k++) {

                                if (count > 6) {
                                    count = 0
                                }

                                var currentColor = name[k].charCodeAt(0);

                                while (currentColor > 15) {
                                    currentColor = currentColor - 16;
                                }


                                var invertedColor = 15 - currentColor;


                                while (invertedColor > 7) {
                                    invertedColor = invertedColor - 2;
                                }


                                /*console.log(currentColor + " - Inverted to : " + invertedColor);*/

                                sizeColorForName[count] = currentColor;
                                sizeColorText[count] = invertedColor;


                                count++
                            }


                            for (var o = 0; o < sizeColorForName.length; o++) {
                                color += letters[sizeColorForName[o]];
                                textColor += letters[sizeColorText[o]];
                            }

                            /*

                             if(x == 0){
                             var currentColor
                             for (var h = 0; h < 4; h++ ) {
                             currentColor = letters[Math.floor(Math.random() * 16)];

                             if(currentColor >)

                             color += currentColor;
                             sizeMainColor[h] = currentColor;
                             }
                             }else{
                             for (h = 0; h < 4; h++ ) {
                             color += sizeMainColor[h];
                             }
                             }

                             for (h = 4; h < 6; h++ ) {
                             color += letters[Math.floor(Math.random() * 16)];
                             }

                             */

                            return {boxColor: color, textColor: textColor};
                        }


                        size_array[x].name = size_name_array_now[x];


                        size_array[x].color = getRandomColor(size_name_array_now[x]);

                        /*console.log(size_array[x].color);*/
                    }


                    $scope.menuItemsExtended[i].sizes = size_array;

                }
                /*
                 console.log($scope.menuItemsExtended);*/

                /*No longer automaticly load command*/
                /*
                 $scope.getCommand();*/

                /*End of loading screen*/

                window.loading_screen.finish();

                $scope.numPadMsg = msgEnterEmployeeNumber;
                mainText.attr('type', 'text');
                mainText.attr('placeholder', 'Numéro d\'employé');
                /*
                 $scope.authenticateEmployee();*/
                $scope.changeEmployee();


                modalChangeEmployee.prepend(windowModalBlockerHtml);
                modalChangeEmployee.find('#closeModal').hide();


                var $url = 'http://pos.mirageflow.com/extras/list';
                var $callbackFunctionExtraList = function (response) {

                    console.log("Extra list received inside response");

                    $scope.extras = response;
                };


                getReq.send($url, null, $callbackFunctionExtraList);

                $url = 'http://pos.mirageflow.com/filters/list';
                var $callbackFunctionFilterList = function (response) {

                    console.log("Filters list received inside response");

                    $scope.menuFilters = response;
                    console.log(response)
                };


                getReq.send($url, null, $callbackFunctionFilterList);


            };

            getReq.send($url, null, $callbackFunction);


        };

        getReq.send($url, null, $callbackFunction);
        /*End loadind element - After the callback if exist*/

        $scope.filteredItems = [];

        $scope.filterItemList = [];
        $scope.filterItemTypeList = [];

        $scope.itemTypeArray = [];
        $scope.applyFilter = function (menuFilter) {
            $scope.filters.itemtype = {};
            $scope.filters.itemtype.type = -1;
            var l;
            $scope.itemArray = [];
            for (l = 0; l < menuFilter.items.length; l++) {
                $scope.itemArray.push(menuFilter.items[l])
            }
            $scope.itemTypeArray = [];
            for (l = 0; l < menuFilter.itemtypes.length; l++) {
                $scope.itemTypeArray.push(menuFilter.itemtypes[l].itemtype);
            }


            $scope.filteredItems = $scope.filteringItems($scope.menuItemsExtended, $scope.itemTypeArray, $scope.itemArray)
        }

        $scope.filteringItems = function (items, itemtypesArray, itemsArray) {
            var out = [];
            var anItemFilter;
            var itemsFound;

            angular.forEach(items, function (subItems) {
                var backup = subItems;
                itemsFound = [];
                angular.forEach(subItems, function (item) {
                    anItemFilter = false;
                    angular.forEach(itemsArray, function (filterItem) {
                        if (item.id == filterItem.item.id) {
                            itemsFound.push(item);
                            anItemFilter = true;
                        }
                    });

                    if (!anItemFilter)
                        angular.forEach(itemtypesArray, function (filterItemType) {
                            if (item.itemtype.id == filterItemType.id)
                                itemsFound.push(item)
                        })

                });

                if (itemsFound.length > 0) {
                    itemsFound.sizes = backup.sizes;
                    out.push(itemsFound);
                }

            });


            return out;
        };

        $scope.removeFilters = function () {
            $scope.filteredItems = [];
            $scope.itemTypeArray = [];
            $scope.itemArray = [];
        };

        /*Add a given note to a given item inside the current command*/
        $scope.addNote = function (note, item) {

            if (note != "" && note != undefined) {
                if (typeof item != 'undefined' && item != null) {
                    item.notes.push({note: note});
                }
                else {
                    if (typeof $scope.commandClient[$scope.commandCurrentClient].notes === 'undefined' || $scope.commandClient[$scope.commandCurrentClient].notes === null || $scope.commandClient[$scope.commandCurrentClient].notes === "")
                        $scope.commandClient[$scope.commandCurrentClient].notes = [];

                    $scope.commandClient[$scope.commandCurrentClient].notes.push({note: note})
                }

                $scope.noteDynamicPopover.note = '';

                $scope.updateCommand();
            }
        };

        /*Add a given note to a given item inside the current command*/
        $scope.addExtra = function (extra, item) {

            if (extra != "" && extra != undefined) {
                if (typeof item != 'undefined' && item != null) {
                    if (typeof item.extras == 'undefined' || item.extras == null)
                        item.extras = [];
                    item.extras.push({name: extra.name, value: extra.value, effect: extra.effect});
                }
                else {
                    if (typeof $scope.commandClient[$scope.commandCurrentClient].extras === 'undefined' || $scope.commandClient[$scope.commandCurrentClient].extras === null || $scope.commandClient[$scope.commandCurrentClient].extras === "")
                        $scope.commandClient[$scope.commandCurrentClient].extras = [];

                    $scope.commandClient[$scope.commandCurrentClient].extras.push(extra)
                }

                $scope.updateCommand();
            }
        };

        /*Delete a given note to a given item inside the current command*/
        $scope.deleteItemNote = function (note, item) {
            var index;
            if (typeof item != 'undefined' && item != null) {
                index = item.indexOf(note);
                item.splice(index, 1);
            }
            else {
                index = $scope.commandClient[$scope.commandCurrentClient].notes.indexOf(note);
                $scope.commandClient[$scope.commandCurrentClient].notes.splice(index, 1);
            }
            $scope.updateCommand();
        };

        /*Delete a given note to a given item inside the current command*/
        $scope.deleteItemExtra = function (extra, item) {
            var index;
            if (typeof item != 'undefined' && item != null) {
                index = item.indexOf(extra);
                item.splice(index, 1);
            }
            else {
                index = $scope.commandClient[$scope.commandCurrentClient].notes.indexOf(extra);
                $scope.commandClient[$scope.commandCurrentClient].notes.splice(index, 1);
            }
            $scope.updateCommand();
        };


        $scope.chargeBill = function (bill) {

            /*Popup modal for charging client*/
            $scope.showPayBillPanel = true;


            $scope.billInTransaction = bill;

            $scope.paymentCurrentStep = 'transac';


            /* Will authenticate with the interact or the */
            bill.status = 2;


        };

        billWindow.mouseup(function (e) {
            if ($scope.showPayBillPanel) {
                var container = $("#pay-bill-panel");

                if (!container.is(e.target) // if the target of the click isn't the container...
                    && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    //container.hide();

                    $scope.showPayBillPanel = false;
                }
            }

        });


        $scope.paymentType = function (type) {
            if (type == 'credit') {
                $scope.billInTransaction.payment_type = type;
                $scope.stepPayment();
            }
            else if (type == 'debit') {
                $scope.billInTransaction.payment_type = type;
                $scope.stepPayment();
            }
            else if (type == 'cash') {
                $scope.billInTransaction.payment_type = type;
                $scope.stepPayment();
            } else {

            }
        };

        $scope.stepPayment = function () {
            $('.bs-wizard-step.active').removeClass('active').addClass('complete');
            setTimeout(function () {
                $('.bs-wizard-step.disabled').first().removeClass('disabled').addClass('active')
            }, 900)
        };


        $scope.cancelCommand = function (command) {

            $callbackFunction = function () {
                console.log('Command status for command.id changed from ' + command.status + ' to ' + (command.status = 3));
                $scope.delayedUpdateTable();
                /*$scope.showEmployeeModal = false;*/
            };

            $callbackFunction();

            /*$scope.validateEmployeePassword($callbackFunction);*/
        };

        $scope.terminateCommands = function () {
            if (typeof $scope.bills != 'undefined' && $scope.bills != null) {
                var commandsValid = true;
                var invalidMsg = ['Attention!'];
                var index;
                for (var h = 0; h < $scope.commandClient.length; h++) {
                    if (typeof $scope.commandClient[h + 1] != 'undefined' && $scope.commandClient[h + 1] != null) {
                        var commandValid = true;
                        index = h;
                        for (var i = 0; i < $scope.commandClient[h + 1].commandItems.length; i++) {
                            var itemValid = false;
                            for (var b = 0; b < $scope.bills.length; b++) {
                                for (var bi = 0; bi < $scope.bills[b].length; bi++) {
                                    if ($scope.commandClient[h + 1].commandItems[i].command_id == $scope.bills[b][bi].command_id && $scope.commandClient[h + 1].commandItems[i].command_line_id == $scope.bills[b][bi].command_line_id) {
                                        itemValid = true;
                                    }
                                }
                            }
                            if (!itemValid) {
                                commandValid = false;
                                invalidMsg.push('Item non facturé: #' + (i + 1));
                                invalidMsg.push($scope.commandClient[h + 1].commandItems[i].size.name + ' de ' + $scope.commandClient[h + 1].commandItems[i].name + ' sur la commande #' + (index + 1))
                            }
                        }


                        if (!commandValid) {
                            commandsValid = false;
                        }
                    }

                }

                if (commandsValid) {
                    $callbackFunction = function () {
                        for (var h = 0; h < $scope.commandClient.length; h++) {
                            if (typeof $scope.commandClient[h + 1] != 'undefined' && $scope.commandClient[h + 1] != null) {
                                console.log('Command status for command.id changed from ' + $scope.commandClient[h + 1].status + ' to ' + ($scope.commandClient[h + 1].status = 2))
                            }
                        }

                        $scope.updateTable(function () {
                            $scope.bills = [];
                            $scope.commandClient = []
                        });
                        /*$scope.showEmployeeModal = false;*/
                        /*$scope.showPlanModal = true;*/
                        $scope.closeBill();
                        $scope.bills = null;
                    };

                    $callbackFunction();
                    /*$scope.validateEmployeePassword($callbackFunction);*/
                }
                else {
                    $scope.showTerminateCommandInfo = true;
                    $scope.terminateCommandInfo = invalidMsg;

                    // then call setTimeout again to reset the timer
                    setTimeout(function () {
                        $scope.showTerminateCommandInfo = false;
                        $scope.terminateCommandInfo = []
                    }, 1000 + $scope.terminateCommandInfo.length * 1000);
                }


            }
            else {
                $scope.showTerminateCommandInfo = true;
                $scope.terminateCommandInfo.push("Il n'y a pas de facture, finissez la facturation.");
                $scope.terminateCommandInfo.push("Sinon, Annulez la commande et terminez la de nouveau.");

                // then call setTimeout again to reset the timer
                setTimeout(function () {
                    $scope.showTerminateCommandInfo = false;
                    $scope.terminateCommandInfo = []
                }, 3000);

                /* There is no bill, you can either finish it. OR cancel it and terminate again*/
            }

        };
        /*
         $scope.findCommandItemsInBills ?*/

        $scope.terminateCommand = function (command) {

            /*If there is no bill*/
            if (typeof $scope.bills != 'undefined' && $scope.bills != null) {
                var valid = true;
                var invalidMsg = ['Attention!'];
                var index = $scope.commandClient.indexOf(command);
                for (var i = 0; i < command.commandItems.length; i++) {
                    var itemValid = false;
                    for (var b = 0; b < $scope.bills.length; b++) {
                        for (var bi = 0; bi < $scope.bills[b].length; bi++) {
                            if (command.commandItems[i].command_id == $scope.bills[b][bi].command_id && command.commandItems[i].command_line_id == $scope.bills[b][bi].command_line_id) {
                                itemValid = true;
                            }
                        }
                    }
                    if (!itemValid) {
                        valid = false;
                        invalidMsg.push('Item non facturé: #' + (i + 1));
                        invalidMsg.push(command.commandItems[i].size.name + ' de ' + command.commandItems[i].name + ' sur la commande #' + (index))
                    }
                }

                if (valid) {
                    $callbackFunction = function () {
                        console.log('Command status for command.id changed from ' + command.status + ' to ' + (command.status = 2));


                        /*Suggest the employee to cancel the command to terminate or to finish it, bill included*/

                        $scope.updateTable(function () {
                            $scope.commandClient.splice(index, 1)
                        });

                        /*$scope.showEmployeeModal = false;*/

                    };

                    $callbackFunction();
                    /*$scope.validateEmployeePassword($callbackFunction);*/
                }
                else {
                    $scope.showTerminateCommandInfo = true;
                    $scope.terminateCommandInfo = invalidMsg;

                    // then call setTimeout again to reset the timer
                    setTimeout(function () {
                        $scope.showTerminateCommandInfo = false;
                        $scope.terminateCommandInfo = []
                    }, 1000 + $scope.terminateCommandInfo.length * 1000);
                }

            }
            else {
                $scope.showTerminateCommandInfo = true;
                $scope.terminateCommandInfo.push("Il n'y a pas de facture, finissez la facturation.");
                $scope.terminateCommandInfo.push("Sinon, Annulez la commande et terminez la de nouveau.");

                // then call setTimeout again to reset the timer
                setTimeout(function () {
                    $scope.showTerminateCommandInfo = false;
                    $scope.terminateCommandInfo = []
                }, 3000);

                /* There is no bill, you can either finish it. OR cancel it and terminate again*/
            }
        };

        $scope.reactivateCommand = function (command) {

            $callbackFunction = function () {
                console.log('Command status for command.id changed from ' + command.status + ' to ' + (command.status = 1));
                $scope.delayedUpdateTable();
                /*$scope.showEmployeeModal = false;*/
            };

            $callbackFunction();
            /* $scope.validateEmployeePassword($callbackFunction);*/
        };

        $scope.changeCommandItemsStatus = function () {
            if ($scope.commandClient[$scope.commandCurrentClient].commandItems.length > 0) {
                for (var i = 0; i < $scope.commandClient[$scope.commandCurrentClient].commandItems.length; i++) {
                    if ($scope.commandClient[$scope.commandCurrentClient].commandItems[i].status == 1) {
                        $scope.commandClient[$scope.commandCurrentClient].commandItems[i].status = 2;
                        $scope.delayedUpdateTable();
                    }
                }
            }

        };

        /*Add an item to the current command*/
        $scope.addItem = function () {

            $scope.selectedItemForSize['quantity'] = 1;

            $scope.selectedItemForSize['notes'] = [];
            $scope.selectedItemForSize['extras'] = [];

            //Eventually selected size
            $scope.selectedItemForSize['size'] = angular.copy($scope.sizeProp.value);

            var time = new Date();
            $scope.selectedItemForSize['time'] = time.getHours() + "H" + ((time.getMinutes().toString().length < 2) ? "0" : "") + time.getMinutes();

            $scope.selectedItemForSize['status'] = 1;

            var result = "";

            if ($scope.commandClient[$scope.commandCurrentClient] != null && typeof $scope.commandClient[$scope.commandCurrentClient].commandItems != 'undefined' && $scope.commandClient[$scope.commandCurrentClient].commandItems != null)
                result = $.grep($scope.commandClient[$scope.commandCurrentClient].commandItems, function (e) {
                    return e.id == $scope.selectedItemForSize.id && e.size.value == $scope.selectedItemForSize.size.value && e.status == 1;
                });

            if (result != "") {
                result[0]['quantity'] = result[0]['quantity'] + 1;
            }
            else {
                /*$scope.commandItems.push(angular.copy($scope.selectedItemForSize));
                 */

                if (typeof $scope.commandClient[$scope.commandCurrentClient] === 'undefined' || $scope.commandClient[$scope.commandCurrentClient] === null)
                    $scope.commandClient[$scope.commandCurrentClient] = {};

                if (typeof $scope.commandClient[$scope.commandCurrentClient].commandItems === 'undefined' || $scope.commandClient[$scope.commandCurrentClient].commandItems === null)
                    $scope.commandClient[$scope.commandCurrentClient].commandItems = [];

                $scope.commandClient[$scope.commandCurrentClient].commandItems.push(angular.copy($scope.selectedItemForSize));
            }


            $scope.updateCommand();
        };


        /*Launch a delayed update the commands of the current table - And update de current command numbers*/
        $scope.updateCommand = function () {
            $scope.delayedUpdateTable();
            $scope.updateTotal();
        };

        /*Update the numbers for the current command*/
        $scope.updateBillsTotal = function () {


            for (var d = 0; d < $scope.bills.length; d++) {

                var subTotal = 0;
                var taxTotal = 0;

                if ($scope.bills[d].length > 0) {
                    for (var l = 0; l < $scope.bills[d].length; l++) {

                        if ($scope.bills[d][l].cost) {

                            if (!$scope.bills[d][l].size.name) {
                                $scope.bills[d][l].size = {
                                    name: $scope.bills[d][l].size,
                                    price: $scope.bills[d][l].cost
                                };
                            }

                        }

                        subTotal += $scope.bills[d][l].size.price * $scope.bills[d][l].quantity;
                        if (typeof $scope.bills[d][l].extras != 'undefined' && $scope.bills[d][l].extras != null) {
                            for (var o = 0; o < $scope.bills[d][l].extras.length; o++)
                                if ($scope.bills[d][l].extras[o].effect == '-')
                                    subTotal -= $scope.bills[d][l].extras[o].value * $scope.bills[d][l].quantity;
                                else if ($scope.bills[d][l].extras[o].effect == '+')
                                    subTotal += $scope.bills[d][l].extras[o] * $scope.bills[d][l].quantity;
                                else if ($scope.bills[d][l].extras[o].effect == '*')
                                    subTotal += $scope.bills[d][l].size.price * $scope.bills[d][l].extras[o].value / 100 * $scope.bills[d][l].quantity;
                                else if ($scope.bills[d][l].extras[o].effect == '/')
                                    subTotal -= $scope.bills[d][l].size.price * $scope.bills[d][l].extras[o].value / 100 * $scope.bills[d][l].quantity;
                        }

                    }

                    for (j = 0; j < $scope.bills[d].taxes.length; j++) {

                        $scope.bills[d].taxes[j].total = subTotal * $scope.bills[d].taxes[j].value;
                        taxTotal += $scope.bills[d].taxes[j].total
                    }

                    console.log($scope.bills[d]);
                    console.log(subTotal);
                    console.log(taxTotal);

                    $scope.bills[d].subTotal = subTotal;
                    $scope.bills[d].total = subTotal + taxTotal;
                }
            }

        };

        /*Update the numbers for the current command*/
        $scope.updateTotal = function () {

            var subTotal = 0;
            var taxTotal = 0;

            for (var j = 0; j < $scope.taxes.length; j++) {
                $scope.taxes[j].total = 0;
            }

            if (typeof $scope.commandClient[$scope.commandCurrentClient] === 'undefined' || $scope.commandClient[$scope.commandCurrentClient] === null) {

                $scope.commandClient[$scope.commandCurrentClient] = {};
                $scope.commandClient[$scope.commandCurrentClient].commandItems = [];

            }

            if ($scope.commandClient[$scope.commandCurrentClient].commandItems.length > 0) {
                for (var i = 0; i < $scope.commandClient[$scope.commandCurrentClient].commandItems.length; i++) {
                    subTotal += $scope.commandClient[$scope.commandCurrentClient].commandItems[i].quantity * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].size.price;

                    if (typeof $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras != 'undefined' && $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras != null) {
                        for (var o = 0; o < $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras.length; o++)
                            if ($scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o].effect == '-')
                                subTotal -= $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o].value * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].quantity;
                            else if ($scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o].effect == '+')
                                subTotal += $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o] * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].quantity;
                            else if ($scope.commandClient[$scope.commandCurrentClient].commandItems[i].effect == '*')
                                subTotal += $scope.commandClient[$scope.commandCurrentClient].commandItems[i].size.price * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o].value / 100 * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].quantity;
                            else if ($scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o].effect == '/')
                                subTotal -= $scope.commandClient[$scope.commandCurrentClient].commandItems[i].size.price * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].extras[o].value / 100 * $scope.commandClient[$scope.commandCurrentClient].commandItems[i].quantity;
                    }


                }

                for (j = 0; j < $scope.taxes.length; j++) {
                    $scope.taxes[j].total = subTotal * $scope.taxes[j].value;
                    taxTotal += $scope.taxes[j].total;
                }

                $scope.subTotalBill = subTotal;
                $scope.totalBill = subTotal + taxTotal;
            }
            else {
                for (j = 0; j < $scope.taxes.length; j++) {
                    $scope.taxes[j].total = 0;
                }
                $scope.subTotalBill = 0;
                $scope.totalBill = 0;
            }
        };

        /*On menu item click*/
        /*Will basicly set the required variable to add the item to the current command*/
        $scope.selectedItem = function (item, sizeSelected) {

            var size_prices_array = JSON.parse(item['size_prices_array']);

            var size_names = item['itemtype']['size_names'];

            var size_name_array = size_names.split(",");

            //For each
            var sizes = [];

            for (var i = 0, len = size_name_array.length; i < len; i++) {

                sizes.push(
                    {
                        name: size_name_array[i],
                        price: size_prices_array[i],
                        value: i + size_prices_array[i]
                    }
                )
            }

            $scope.sizeProp = {
                "name": size_name_array[0],
                price: size_prices_array[0],
                "value": $.grep(sizes, function (e) {
                    return e.name == sizeSelected;
                })[0],
                "values": sizes
            };

            $scope.selectedItemForSize = item;
        };

        /*
         $scope.payNow = function () {

         $url = 'http://pos.mirageflow.com/menu/payer';
         $data = $scope.commandClient[$scope.commandCurrentClient].commandItems;

         var $callbackFunction = function(response){

         console.log("Paying confirmation received inside response");

         $scope.commandClient[$scope.commandCurrentClient].commandItems = [];
         $scope.updateCommand();
         };

         postReq.send($url, $data, null, $callbackFunction);

         }
         */

        /*Launch delayed function that can always be cancel - To update the current table*/
        $scope.delayedUpdateTable = function () {
            $scope.savingMessage = "Sauvegarde automatique..";

            $timeout(function () {
                $scope.progressValue = 50;
                $('.progress-bar').removeClass('progress-bar-success');
            }, 0);

            // in your click function, call clearTimeout
            window.clearTimeout(timeoutHandle);

            // then call setTimeout again to reset the timer
            timeoutHandle = window.setTimeout(function () {
                $scope.updateTable();

            }, 2000);
        };

        /*Launch delayed function that can always be cancel - To update the current table*/
        $scope.delayedUpdateBills = function () {
            $scope.savingMessage = "Sauvegarde automatique..";

            $timeout(function () {
                $scope.progressValue = 50;
                $('.progress-bar').removeClass('progress-bar-success');
            }, 0);

            // in your click function, call clearTimeout
            window.clearTimeout(billTimeoutHandle);

            // then call setTimeout again to reset the timer
            billTimeoutHandle = window.setTimeout(function () {
                $scope.updateBills();

            }, 2000);
        };


        /*Will send a request to update the table and then execute the callbackFunction*/
        $scope.updateTable = function ($updateTableCallBack) {


            var $url = 'http://pos.mirageflow.com/menu/command';

            var $data = {
                commands: $scope.commandClient,
                table: $scope.currentTable,
                employee: $scope.currentEmploye
            };


            var $callbackFunction = function (response) {
                console.log('Updated table');
                if (typeof response.commands != 'undefined' && response.commands != null) {

                    for (var f = 0; f < response.commands.length; f++) {
                        /*if(typeof $scope.commandClient[f+1] != 'undefined' && $scope.commandClient[f+1] != null)*/
                        $scope.commandClient[f + 1].command_number = response.commands[f].command_number + "";

                        for (var g = 0; g < response.commandLineIdMat[f].length; g++) {
                            $scope.commandClient[f + 1].commandItems[g].command_id = $scope.commandClient[f + 1].id;
                            $scope.commandClient[f + 1].commandItems[g].command_line_id = response.commandLineIdMat[f][g]
                        }
                    }

                    $timeout(function () {
                        $scope.progressValue = 100;
                        $('.progress-bar').addClass('progress-bar-success');
                        $scope.savingMessage = "Sauvegardé!"
                    }, 0);

                    console.log("The command as been saved and confirmation received inside response - Success or Not ?");

                    if ($updateTableCallBack != null)
                        $updateTableCallBack();

                }
            };
            /*
             $scope.commandClient[$scope.commandCurrentClient].commandItems = [];
             $scope.updateCommand();*/

            postReq.send($url, $data, null, $callbackFunction);

        };

        /*Will send a request to update the bills and then execute the callbackFunction*/
        $scope.updateBills = function ($updateTableCallBack) {


            $url = 'http://pos.mirageflow.com/menu/bill';

            $data = {
                bills: $scope.bills,
                table: $scope.currentTable,
                employee: $scope.currentEmploye
            };


            var $callbackFunction = function (response) {
                console.log('Updated bills');
                if (typeof response.saleLineIdMat != 'undefined' && response.saleLineIdMat != null) {
                    for (var f = 0; f < response.saleLineIdMat.length; f++) {

                        for (var g = 0; g < response.saleLineIdMat[f].length; g++) {
                            $scope.bills[f][g].saleLineId = response.saleLineIdMat[f][g];
                            $scope.bills[f][g].sale_id = response.saleIdArray[f];
                        }
                    }
                }


                $timeout(function () {
                    $scope.progressValue = 100;
                    $('.progress-bar').addClass('progress-bar-success');
                    $scope.savingMessage = "Sauvegardé!"
                }, 0);

                console.log("The bill as been saved and confirmation received inside response - Success or Not ?");

                if ($updateTableCallBack != null)
                    $updateTableCallBack();
            };


            /*      if (timeoutHandle != null){
             $scope.getCommand();
             timeoutHandle = null;
             }*/


            /*  $timeout(function () {*/
            postReq.send($url, $data, null, $callbackFunction);
            /*     $scope.progressValue = 100;
             $('.progress-bar').addClass('progress-bar-success');
             $scope.savingMessage = "Commande Sauvegardé!"
             }, 500);
             */

        };

        /*Will send a request to update the bills and then execute the callbackFunction*/
        $scope.deleteCommandsBills = function ($callBack) {


            var $url = 'http://pos.mirageflow.com/menu/delete/bill';

            var $data = {
                bills: $scope.bills,
                table: $scope.currentTable,
                employee: $scope.currentEmploye
            };


            var $callbackFunction = function (response) {
                console.log('Deleted bills');
                $scope.bills = null;


                $timeout(function () {
                    $scope.progressValue = 100;
                    $scope.savingMessage = "Facture effacé!"
                }, 0);

                console.log("Facture effacé - Success or Not ?");

                if ($callBack != null)
                    $callBack();
            };


            /*      if (timeoutHandle != null){
             $scope.getCommand();
             timeoutHandle = null;
             }*/


            /*  $timeout(function () {*/
            postReq.send($url, $data, null, $callbackFunction);
            /*     $scope.progressValue = 100;
             $('.progress-bar').addClass('progress-bar-success');
             $scope.savingMessage = "Commande Sauvegardé!"
             }, 500);
             */

        };

        /*Client pager - set page*/
        $scope.setPage = function (pageNo) {
            $scope.commandCurrentClient = pageNo;
        };

        /*Client pager - page changed*/
        $scope.pageChanged = function () {
            console.log('Changed to client #' + $scope.commandCurrentClient);
            $scope.updateTotal();
        };

        //Toggle function to display panel - May be called on click
        $scope.toggleEmployeeModal = function () {
            $scope.showEmployeeModal = !$scope.showEmployeeModal;
        };

        $scope.toggleTableModal = function () {
            $scope.showTableModal = !$scope.showTableModal;
            if ($scope.showTableModal) {
                $scope.getPlan();
                if ($scope.showPlanModal)
                    $scope.togglePlanModal();
            }


        };
        $scope.toggleBillDemo = function () {
            $scope.showBillDemo = !$scope.showBillDemo;
            $scope.movingBillItem = !$scope.movingBillItem;
        };
        $scope.togglePlanModal = function () {
            $scope.showPlanModal = !$scope.showPlanModal;
            if ($scope.showPlanModal) {
                $scope.getPlan();
                if ($scope.showTableModal)
                    $scope.toggleTableModal();
            }

        };
        $scope.toggleDivideBillModal = function () {
            if (typeof $scope.bills == 'undefined' || $scope.bills == null || $scope.showPanelOverwriteBill) {
                $scope.showDivideBillModal = !$scope.showDivideBillModal;
                if (timeoutHandle != null) {
                    $scope.updateTable(function () {
                        $scope.getCommand();
                    });

                    timeoutHandle = null;
                }
            }
            else
                $scope.showPanelOverwriteBill = true;
        };
        $scope.togglePanelOverwriteBill = function () {
            $scope.showPanelOverwriteBill = !$scope.showPanelOverwriteBill;
        };
        $scope.toggleHeaderOptions = function () {
            $scope.showHeaderOptions = !$scope.showHeaderOptions
        };
        $scope.toggleBill = function () {
            if ($scope.bills == null || typeof $scope.bills == 'undefined' || ($scope.bills != null & typeof $scope.bills != 'undefined' && $scope.bills.length == 1))
                $scope.divideBill();
            else {
                if (!$scope.showBillWindow)
                    $scope.openBill();
                else
                    $scope.closeBill();
            }


        };
        $scope.openBill = function () {
            if (typeof $scope.bills != 'undefined')
                $scope.addNewItemToBill();
            $scope.showBillWindow = true;
            billWindow.slideDown(400);
        };
        $scope.closeBill = function () {
            $scope.showBillWindow = false;
            billWindow.slideUp(250);
        };

        /*Toggle to display time or money on current command items*/
        $scope.toggleCommandTime = function () {
            $scope.commandItemTimeToggle = !$scope.commandItemTimeToggle;
        };

        $scope.toogleFullscreen = function () {
            fullscreenFlag = !fullscreenFlag;
            if (fullscreenFlag) {
                fullscreen();
            } else {
                console.log('etst');
                cancelFullScreen();
            }

        };

        /*Send a request to get the bill*/
        $scope.getBills = function () {

            $scope.commandsId = [];
            for (var h = 0; h < $scope.commandClient.length; h++) {
                if (typeof $scope.commandClient[h + 1] != 'undefined' && $scope.commandClient[h + 1] != null)
                    $scope.commandsId.push($scope.commandClient[h + 1].id)
            }

            var $url = 'http://pos.mirageflow.com/menu/getBills';
            var $data = {commandsId: $scope.commandsId};

            var $callbackFunction = function (response) {

                /*
                 $scope.bills = null;*/

                if (response.success == "true") {
                    $scope.bills = [];
                    for (var k in response.bills) {
                        if (response.bills.hasOwnProperty(k)) {
                            $scope.bills.push(response.bills[k]);
                            /*$scope.bills[$scope.bills.length-1] = bill;*/

                            var subTotal = 0;
                            var taxTotal = 0;

                            for (var l = 0; l < $scope.bills[$scope.bills.length - 1].length; l++) {
                                subTotal += $scope.bills[$scope.bills.length - 1][l].cost * $scope.bills[$scope.bills.length - 1][l].quantity;

                                if (typeof $scope.bills[$scope.bills.length - 1][l].extras != 'undefined' && $scope.bills[$scope.bills.length - 1][l].extras != null) {
                                    for (var o = 0; o < $scope.bills[$scope.bills.length - 1][l].extras.length; o++)
                                        if ($scope.bills[$scope.bills.length - 1][l].extras[o].effect == '-')
                                            subTotal -= $scope.bills[$scope.bills.length - 1][l].extras[o].value * $scope.bills[$scope.bills.length - 1][l].quantity;
                                        else if ($scope.bills[$scope.bills.length - 1][l].extras[o].effect == '+')
                                            subTotal += $scope.bills[$scope.bills.length - 1][l].extras[o] * $scope.bills[$scope.bills.length - 1][l].quantity;
                                        else if ($scope.bills[$scope.bills.length - 1][l].extras[o].effect == '*')
                                            subTotal += $scope.bills[$scope.bills.length - 1][l].size.price * $scope.bills[$scope.bills.length - 1][l].extras[o].value / 100 * $scope.bills[$scope.bills.length - 1][l].quantity;
                                        else if ($scope.bills[$scope.bills.length - 1][l].extras[o].effect == '/')
                                            subTotal -= $scope.bills[$scope.bills.length - 1][l].size.price * $scope.bills[$scope.bills.length - 1][l].extras[o].value / 100 * $scope.bills[$scope.bills.length - 1][l].quantity;
                                }


                                var itemWhereId = angular.copy($.grep($scope.menuItems, function (e) {
                                    return e.id == $scope.bills[$scope.bills.length - 1][l].item_id
                                })[0]);

                                var id;


                                id = $scope.bills[$scope.bills.length - 1][l].id;
                                var sale_id = $scope.bills[$scope.bills.length - 1][l].sale_id;

                                console.log('extras');
                                var extras = $scope.bills[$scope.bills.length - 1][l].extras;

                                for (var ob in itemWhereId) {
                                    if (itemWhereId.hasOwnProperty(ob)) {
                                        $scope.bills[$scope.bills.length - 1][l][ob] = itemWhereId[ob];
                                    }
                                }

                                $scope.bills[$scope.bills.length - 1][l].saleLineId = id;
                                $scope.bills[$scope.bills.length - 1][l].sale_id = sale_id;
                                if (typeof extras != 'undefined' && extras != null && extras != "")
                                    $scope.bills[$scope.bills.length - 1][l].extras = JSON.parse(extras);


                            }

                            /*Copy the taxes and change its total to 0*/
                            var taxes = angular.copy($scope.taxes);
                            for (var j = 0; j < taxes.length; j++) {
                                taxes[j].total = subTotal * taxes[j].value;
                                taxTotal += taxes[j].total;
                            }

                            $scope.bills[$scope.bills.length - 1].number = $scope.bills.length;
                            $scope.bills[$scope.bills.length - 1].subTotal = subTotal;
                            $scope.bills[$scope.bills.length - 1].taxes = taxes;
                            $scope.bills[$scope.bills.length - 1].total = subTotal + taxTotal;


                        }
                    }
                    $scope.updateBillsTotal();

                    $scope.newLastBill();
                    billWindow.slideUp(0);
                    billWindow.css('visibility', 'visible');

                    $scope.openBill();

                    console.log('Bills');
                    console.log($scope.bills)
                }
                else {
                    $scope.bills = null;
                    $scope.closeBill();
                }


            };
            postReq.send($url, $data, null, $callbackFunction);
        };

        /*Send a request to authenticate the employee*/
        $scope.authenticateEmployee = function () {

            if ($scope.newUserId != null) {
                var $url = 'http://pos.mirageflow.com/employee/authenticate/' + $scope.newUserId;
                var $data = {password: $scope.newUserPassword};

                var $callbackFunction = function (response) {

                    if (!response.hasOwnProperty('error')) {
                        console.log("User is valid :");
                        console.log(response);

                        if (pendingRequestAuthRequest != null) {
                            pendingRequestAuthRequest();
                        }
                        else {
                            $scope.currentEmploye = response;
                            $scope.getCommand();
                            $scope.getPlan();
                        }

                        modalChangeEmployee.find('#windowModalBlocker').fadeOut(300, function () {
                            $(this).remove();
                        });
                        $scope.showEmployeeModal = false;
                    }
                    else {
                        console.log("User is invalid :");
                        console.log(response.error);


                        $scope.validation = false;
                        $scope.numPadMsg = msgEnterEmployeeNumber;
                        mainText.attr('type', 'text');
                        mainText.attr('placeholder', 'Numéro d\'employé');
                        $scope.numPadErrMsg = response.error;
                        $scope.showEmployeeModal = true;
                        $scope.mainText = '';
                    }


                };


                postReq.send($url, $data, null, $callbackFunction);
            }
        };

        /*Will display the employee modal with reinitialized value*/
        $scope.changeEmployee = function () {
            if (!$scope.showEmployeeModal) {
                $scope.toggleEmployeeModal();

                $scope.numPadErrMsg = '';
                $scope.numPadMsg = msgEnterEmployeeNumber;
                mainText.attr('type', 'text');
                mainText.attr('placeholder', 'Numéro d\'employé');
                $scope.mainText = '';
                $scope.validation = false;
            }
        };

        /*Return to employee number on employee modal*/
        $scope.changeEmployeeStepBack = function () {
            $scope.numPadMsg = msgEnterEmployeeNumber;
            mainText.attr('type', 'text');
            mainText.attr('placeholder', 'Numéro d\'employé');
            $scope.mainText = '';
            $scope.validation = false;
            $scope.numPadErrMsg = ''
        };

        $scope.validateEmployeePassword = function ($callbackFunction) {
            if (!$scope.showEmployeeModal) {
                console.log($scope.currentEmploye);
                $scope.toggleEmployeeModal();
                pendingRequestAuthRequest = function () {
                    $callbackFunction();
                    pendingRequestAuthRequest = null;
                };

                $scope.numPadErrMsg = '';
                $scope.newUserId = $scope.currentEmploye.id;
                $scope.numPadMsg = msgEnterEmployeePassword;
                mainText.attr('placeholder', 'Mot de passe');
                mainText.attr('type', 'password');

                /*We need to validate*/
                $scope.validation = true;

                /*Empty the field*/
                $scope.mainText = '';
            }
        };

        /*Employee numpad triggers - will authenticate or validate password on Enter click*/
        $scope.padClick = function ($value) {
            switch ($value) {
                case 'dl':
                    $scope.mainText = $scope.mainText.slice(0, -1);
                    break;
                case 'cl':
                    $scope.mainText = "";
                    break;
                case 'clk':
                    punchEmployee();
                    break;
                case 'ent':
                    if ($scope.validation) {
                        $scope.newUserPassword = $scope.mainText;
                        $scope.authenticateEmployee();
                    }
                    else {
                        $scope.numPadErrMsg = '';
                        $scope.newUserId = $scope.mainText;
                        $scope.numPadMsg = msgEnterEmployeePassword;
                        mainText.attr('placeholder', 'Mot de passe');
                        mainText.attr('type', 'password');

                        /*We need to validate*/
                        $scope.validation = true;

                        /*Empty the field*/
                        $scope.mainText = '';
                    }
                    break;
                case 'pt':
                    $scope.mainText = $scope.mainText + ".";
                    break;
                default:
                    $scope.mainText = $scope.mainText + $value;

            }

        };

        $scope.redivideBill = function () {
            $scope.deleteCommandsBills();
            $scope.showPanelOverwriteBill = false;
            $scope.showDivideBillModal = true;
        };

        /*Move the selected items or selected bills items to the given bill*/
        $scope.moveToBill = function (bill) {
            $scope.showBillDemo = false;
            var billSubTotal;
            var billTotal;
            var billTaxes;
            var o;
            var j;
            var index;
            for (var d = 0; d < $scope.bills.length; d++) {
                if ($scope.bills[d].checked) {
                    if ($scope.bills[d] != bill) {
                        for (var l = 0; l < $scope.bills[d].length; l++) {

                            if ($scope.bills[d][l].checked) {
                                $scope.bills[d][l].checked = false;
                                $scope.bills[d][l].sale_id = bill.sale_id;
                            }

                            billSubTotal = $scope.bills[d][l].size.price * $scope.bills[d][l].quantity;

                            if (typeof $scope.bills[d][l].extras != 'undefined' && $scope.bills[d][l].extras != null) {
                                for (o = 0; o < $scope.bills[d][l].extras.length; o++)
                                    if ($scope.bills[d][l].extras[o].effect == '-')
                                        billSubTotal -= $scope.bills[d][l].extras[o].value * $scope.bills[d][l].quantity;
                                    else if ($scope.bills[d][l].extras[o].effect == '+')
                                        billSubTotal += $scope.bills[d][l].extras[o] * $scope.bills[d][l].quantity;
                                    else if ($scope.bills[d][l].extras[o].effect == '*')
                                        billSubTotal += $scope.bills[d][l].size.price * $scope.bills[d][l].extras[o].value / 100 * $scope.bills[d][l].quantity;
                                    else if ($scope.bills[d][l].extras[o].effect == '/')
                                        billSubTotal -= $scope.bills[d][l].size.price * $scope.bills[d][l].extras[o].value / 100 * $scope.bills[d][l].quantity;
                            }

                            billTotal = billSubTotal;
                            /*Copy the billTaxes and change its billTotal to 0*/
                            billTaxes = angular.copy($scope.taxes);
                            for (j = 0; j < billTaxes.length; j++) {
                                billTaxes[j].billTotal = billSubTotal * billTaxes[j].value;
                                billTotal += billTaxes[j].billTotal;
                            }

                            bill.billSubTotal += billSubTotal;
                            bill.billTotal += billTotal;
                            for (j = 0; j < billTaxes.length; j++) {
                                bill.taxes[j].billTotal += billTaxes[j].billTotal;
                            }
                            bill.push($scope.bills[d][l]);


                        }

                        $scope.bills[d] = [];
                    }
                    else {
                        $scope.bills[d].checked = false;
                    }


                }
                else {

                    var checkedItems = $filter("filter")($scope.bills[d], {checked: "true"});
                    for (var f = 0; f < checkedItems.length; f++) {

                        if (bill[0]) {

                            checkedItems[f].sale_id = bill[0].sale_id;
                        }
                        else {
                            checkedItems[f].sale_id = ''
                        }

                        billSubTotal = checkedItems[f].size.price * checkedItems[f].quantity;

                        if (typeof checkedItems[f].extras != 'undefined' && checkedItems[f].extras != null) {
                            for (o = 0; o < checkedItems[f].extras.length; o++)
                                if (checkedItems[f].extras[o].effect == '-')
                                    billSubTotal -= checkedItems[f].extras[o].value * checkedItems[f].quantity;
                                else if (checkedItems[f].extras[o].effect == '+')
                                    billSubTotal += checkedItems[f].extras[o] * checkedItems[f].quantity;
                                else if (checkedItems[f].extras[o].effect == '*')
                                    billSubTotal += checkedItems[f].size.price * checkedItems[f].extras[o].value / 100 * checkedItems[f].quantity;
                                else if (checkedItems[f].extras[o].effect == '/')
                                    billSubTotal -= checkedItems[f].size.price * checkedItems[f].extras[o].value / 100 * checkedItems[f].quantity;
                        }

                        billTotal = billSubTotal;

                        /*Copy the billTaxes and change its billTotal to 0*/
                        billTaxes = angular.copy($scope.taxes);
                        for (j = 0; j < billTaxes.length; j++) {
                            billTaxes[j].billTotal = billSubTotal * billTaxes[j].value;
                            billTotal += billTaxes[j].billTotal;
                        }

                        $scope.bills[d].billSubTotal -= billSubTotal;
                        bill.billSubTotal += billSubTotal;
                        $scope.bills[d].billTotal -= billTotal;
                        bill.billTotal += billTotal;
                        for (j = 0; j < billTaxes.length; j++) {
                            $scope.bills[d].taxes[j].billTotal -= billTaxes[j].billTotal;
                            bill.taxes[j].billTotal += billTaxes[j].billTotal;
                        }

                        checkedItems[f].checked = false;
                        bill.push(checkedItems[f]);

                        index = $scope.bills[d].indexOf(checkedItems[f]);
                        $scope.bills[d].splice(index, 1)
                    }
                    $scope.movingBillItem = false;

                    /*We needed* to recalculate subbillTotal, billTaxes, billTotal of each bill*/
                }

            }

            /*Clear empty bill*/
            for (d = 0; d < $scope.bills.length; d++) {
                /*Re-order bill number*/
                $scope.bills[d].number = d + 1;
                if ($scope.bills[d].length == 0) {
                    index = $scope.bills.indexOf($scope.bills[d]);
                    $scope.bills.splice(index, 1);
                    d--;
                }
            }

            if ($scope.bills[$scope.bills.length - 1].length > 0)
                $scope.newLastBill();


            $scope.delayedUpdateBills();
        };

        /*Show panel to display bills division choice*/
        $scope.divideBill = function () {


            var nonAddedItems = $filter("filter")($scope.commandClient[$scope.commandCurrentClient].commandItems, {status: 1});

            if (nonAddedItems.length == 0)
                $scope.toggleDivideBillModal();
            else {

                $scope.showTerminateCommandInfo = true;
                $scope.terminateCommandInfo.push("Tout les items n'ont pas été ajoutés à la commande.");
                $scope.terminateCommandInfo.push("Ajoutez tous les items avant de pouvoir facturer.");

                // then call setTimeout again to reset the timer
                setTimeout(function () {
                    $scope.showTerminateCommandInfo = false;
                    $scope.terminateCommandInfo = []
                }, 3000);
            }
        };

        /*Onebill choice will create a single bill*/
        $scope.oneBill = function () {
            $scope.toggleDivideBillModal();

            $scope.bills = [];
            var bill = [];
            var subTotal = 0;
            var taxTotal = 0;

            /*Copy the taxes and change its total to 0*/
            var taxes = angular.copy($scope.taxes);
            for (var j = 0; j < taxes.length; j++) {
                taxes[j].total = 0;
            }


            for (var f = 0; f < $scope.commandClient.length; f++) {
                if (typeof $scope.commandClient[f + 1] != 'undefined' && $scope.commandClient[f + 1] != null) {
                    for (var p = 0; p < $scope.commandClient[f + 1].commandItems.length; p++) {
                        var item = angular.copy($scope.commandClient[f + 1].commandItems[p]);
                        item.checked = false;
                        bill.push(item);
                        subTotal += item.size.price * item.quantity;

                        if (typeof item.extras != 'undefined' && item.extras != null) {
                            for (var o = 0; o < item.extras.length; o++)
                                if (item.extras[o].effect == '-')
                                    subTotal -= item.extras[o].value * item.quantity;
                                else if (item.extras[o].effect == '+')
                                    subTotal += item.extras[o] * item.quantity;
                                else if (item.extras[o].effect == '*')
                                    subTotal += item.size.price * item.extras[o].value / 100 * item.quantity;
                                else if (item.extras[o].effect == '/')
                                    subTotal -= item.size.price * item.extras[o].value / 100 * item.quantity;
                        }
                    }
                }
            }

            for (j = 0; j < taxes.length; j++) {
                taxes[j].total = subTotal * taxes[j].value;
                taxTotal += taxes[j].total;
            }

            $scope.bills[0] = bill;
            $scope.bills[0].number = 1;
            $scope.bills[0].subTotal = subTotal;
            $scope.bills[0].taxes = taxes;
            $scope.bills[0].total = subTotal + taxTotal;

            $scope.newLastBill();

            console.log('Bills');
            console.log($scope.bills[0]);


            billWindow.slideUp(0);
            billWindow.css('visibility', 'visible');
            $scope.openBill();
            $scope.delayedUpdateBills();
        };

        /*PerClientBill choice will create a bill for every client*/
        $scope.perClientBill = function () {
            $scope.toggleDivideBillModal();

            $scope.bills = [];
            var bill = [];

            for (var f = 0; f < $scope.commandClient.length; f++) {
                if (typeof $scope.commandClient[f + 1] != 'undefined' && $scope.commandClient[f + 1] != null && $scope.commandClient[f + 1].commandItems.length > 0) {
                    var subTotal = 0;
                    var taxTotal = 0;

                    /*Copy the taxes and change its total to 0*/
                    var taxes = angular.copy($scope.taxes);
                    for (var j = 0; j < taxes.length; j++) {
                        taxes[j].total = 0;
                    }


                    for (var p = 0; p < $scope.commandClient[f + 1].commandItems.length; p++) {

                        var item = angular.copy($scope.commandClient[f + 1].commandItems[p]);
                        item.checked = false;
                        bill.push(item);
                        subTotal += item.size.price * item.quantity;

                        if (typeof item.extras != 'undefined' && item.extras != null) {
                            for (var o = 0; o < item.extras.length; o++)
                                if (item.extras[o].effect == '-')
                                    subTotal -= item.extras[o].value * item.quantity;
                                else if (item.extras[o].effect == '+')
                                    subTotal += item.extras[o] * item.quantity;
                                else if (item.extras[o].effect == '*')
                                    subTotal += item.size.price * item.extras[o].value / 100 * item.quantity;
                                else if (item.extras[o].effect == '/')
                                    subTotal -= item.size.price * item.extras[o].value / 100 * item.quantity;
                        }
                    }

                    for (j = 0; j < taxes.length; j++) {
                        taxes[j].total = subTotal * taxes[j].value;
                        taxTotal += taxes[j].total;
                    }
                    $scope.bills[f] = bill;
                    $scope.bills[f].number = f + 1;
                    $scope.bills[f].subTotal = subTotal;
                    $scope.bills[f].taxes = taxes;
                    $scope.bills[f].total = subTotal + taxTotal;
                    subTotal = 0;
                    bill = [];
                }
            }
            /*
             $scope.bills[$scope.bills.length] = [];
             */

            $scope.newLastBill();

            console.log('Bills');
            console.log($scope.bills[0]);

            billWindow.slideUp(0);
            billWindow.css('visibility', 'visible');
            $scope.openBill();
            $scope.delayedUpdateBills();
        };


        $scope.newLastBill = function () {

            if (typeof $scope.bills != 'undefined' && $scope.bills != null && typeof $scope.bills[0] != 'undefined' && $scope.bills[0].length > 0) {
                $scope.bills[$scope.bills.length] = [];
                $scope.bills[$scope.bills.length - 1].total = 0;
                $scope.bills[$scope.bills.length - 1].subTotal = 0;
                $scope.bills[$scope.bills.length - 1].number = $scope.bills.length;
                /*Copy the taxes and change its total to 0*/
                var taxes = angular.copy($scope.taxes);
                for (var j = 0; j < taxes.length; j++) {
                    taxes[j].total = 0;
                }
                $scope.bills[$scope.bills.length - 1].taxes = taxes;

                console.log($scope.bills)

            }
        };


        $scope.manualBill = function () {
            $scope.toggleDivideBillModal();

            var unasociatedCommandItem = [];

            for (var f = 0; f < $scope.commandClient.length; f++) {
                if (typeof $scope.commandClient[f + 1] != 'undefined' && $scope.commandClient[f + 1] != null && $scope.commandClient[f + 1].commandItems.length > 0) {
                    for (var p = 0; p < $scope.commandClient[f + 1].commandItems.length; p++) {
                        var item = angular.copy($scope.commandClient[f + 1].commandItems[p]);
                        item.checked = false;
                        unasociatedCommandItem.push(item);
                    }
                }
            }

            $scope.bills = [[]];
            $scope.bills[0] = unasociatedCommandItem;
            $scope.bills[0].total = 0;
            $scope.bills[0].subTotal = 0;
            $scope.bills[0].number = " - Liste d'achat";
            /*Copy the taxes and change its total to 0*/
            var taxes = angular.copy($scope.taxes);
            for (var j = 0; j < taxes.length; j++) {
                taxes[j].total = 0;
            }
            $scope.bills[0].taxes = taxes;


            $scope.newLastBill();

            billWindow.slideUp(0);
            billWindow.css('visibility', 'visible');
            $scope.openBill();
        };

        $scope.addNewItemToBill = function (force) {

            $callbackFunction = function () {
                var unasociatedCommandItem = [];

                for (var f = 0; f < $scope.commandClient.length; f++) {
                    if (typeof $scope.commandClient[f + 1] != 'undefined' && $scope.commandClient[f + 1] != null && $scope.commandClient[f + 1].commandItems.length > 0) {
                        for (var p = 0; p < $scope.commandClient[f + 1].commandItems.length; p++) {


                            var item = angular.copy($scope.commandClient[f + 1].commandItems[p]);
                            var flagOn = false;

                            /*Pour chaque item de la commande on doit comparer avec les items des bill avec leur command_line*/
                            for (var k = 0; k < $scope.bills.length && !flagOn; k++) {
                                for (var l = 0; l < $scope.bills[k].length && !flagOn; l++) {
                                    if (typeof $scope.bills[k][l] != 'undefined' && item.command_line_id == $scope.bills[k][l].command_line_id) {
                                        flagOn = true;
                                    }
                                }
                            }

                            if (!flagOn) {
                                if (item.status == 1 || force) {
                                    $scope.commandClient[f + 1].commandItems[p].status = 2;
                                    item.status = 2;
                                    $scope.updateCommand();
                                }
                                unasociatedCommandItem.push(item);
                            }

                            /*

                             var itemInBills = $filter("filter")($scope.bills, {command_line_id: item.command_line_id})[0];*/
                            /* if(typeof itemInBills == 'undefined' || itemInBills == null){

                             }
                             else{
                             itemInBills = $filter("filter")($scope.bills, {command_line_id: item.command_line_id})[0];
                             }*/


                            /*
                             console.log('itemInBills');
                             console.log(itemInBills);*/


                        }
                    }
                }


                console.log('$scope.bills');
                console.log($scope.bills);
                console.log('$scope.commandClient');
                console.log($scope.commandClient);

                if (unasociatedCommandItem.length > 0) {

                    console.log(unasociatedCommandItem);
                    $scope.newLastBill();

                    $scope.bills[$scope.bills.length - 1] = unasociatedCommandItem;
                    $scope.bills[$scope.bills.length - 1].total = 0;
                    $scope.bills[$scope.bills.length - 1].subTotal = 0;
                    $scope.bills[$scope.bills.length - 1].number = "Nouveaux Items";
                    $scope.bills[$scope.bills.length - 1].unasociatedCommandItems = true;
                    /*Copy the taxes and change its total to 0*/
                    var taxes = angular.copy($scope.taxes);
                    for (var j = 0; j < taxes.length; j++) {
                        taxes[j].total = 0;
                    }
                    $scope.bills[$scope.bills.length - 1].taxes = taxes;

                }

            };

            if (timeoutHandle != null)
                $scope.updateTable($callbackFunction);
            else {
                $callbackFunction();
            }


        };

        /*Function to change a bill checked flag - And also addapt the movingBillItem flag */
        $scope.checkBill = function (bill) {

            bill.checked = !bill.checked;

            if (bill.checked && !$scope.showBillDemo) {
                $scope.movingBillItem = true;
            }
            else {
                var checkedItems = $filter("filter")($scope.bills, {checked: "true"})[0];

                if ((typeof checkedItems == "undefined" || checkedItems == null || checkedItems.length == 0) && !$scope.showBillDemo)
                    $scope.movingBillItem = false;

                for (var d = 0; d < $scope.bills.length; d++) {
                    if ($scope.bills[d].checked) {
                        $scope.movingBillItem = true;
                    }
                }
            }
        };


        /*Function to change a bill item checked flag - And also addapt the movingBillItem flag */
        $scope.checkBillItem = function (commandItem) {

            commandItem.checked = !commandItem.checked;

            if (commandItem.checked && !$scope.showBillDemo) {
                $scope.movingBillItem = true;
            }
            else {
                var checkedItems = $filter("filter")($scope.bills, {checked: "true"})[0];

                if ((typeof checkedItems == "undefined" || checkedItems == null || checkedItems.length == 0) && !$scope.showBillDemo)
                    $scope.movingBillItem = false;

                for (var d = 0; d < $scope.bills.length; d++) {
                    if ($scope.bills[d].checked) {
                        $scope.movingBillItem = true;
                    }
                }
            }
        };

        /*Function to trigger a table change
         This will need to update the table if a timeoutHandle for saving is already running */
        $scope.changeTable = function (table) {
            /* Table change wont happen until the current table is saved, the table change will be done on the callback*/
            var $callbackFunction = function (response) {
                console.log('Changed to table #' + table.tblNumber);
                console.log(table);
                $scope.currentTable = table;
                $('#closeModal').click();

                $scope.commandClient = [];
                $scope.clientPagerTotalItems = 0;
                $scope.getCommand();
            };

            if (billTimeoutHandle != null)
                $scope.updateBills();

            if (timeoutHandle != null)
                $scope.updateTable($callbackFunction);
            else {
                $callbackFunction();
            }


        };

        $scope.ajouterClient = function () {

            $scope.clientPagerTotalItems += 10;
            $scope.commandCurrentClient = $scope.clientPagerTotalItems / 10
        };

        /*Send a request to get the commands for the current table*/
        $scope.getCommand = function () {
            $url = 'http://pos.mirageflow.com/menu/getCommand';
            $data = {
                table: $scope.currentTable,
                employee: $scope.currentEmploye
            };
            /*
             console.log('Data to save :');
             console.log($data);*/

            var $callbackFunction = function (response) {
                console.log('GetCommand');
                console.log(response);


                $scope.commandCurrentClient = 1;

                if (response.commands.length > 0) {
                    $scope.clientPagerTotalItems = 0;


                    for (var f = 0; f < response.commands.length; f++) {
                        $scope.clientPagerTotalItems += 10;
                        $scope.commandClient[f + 1] = response.commands[f];


                        if ($scope.commandClient[f + 1].notes != "")
                            $scope.commandClient[f + 1].notes = JSON.parse($scope.commandClient[f + 1].notes);

                        if ($scope.commandClient[f + 1].extras != "")
                            $scope.commandClient[f + 1].extras = JSON.parse($scope.commandClient[f + 1].extras);

                        $scope.commandClient[f + 1].commandItems = response.commands[f]['commandline'];

                        /*
                         console.log('Command line');
                         console.log($scope.commandClient[f+1].commandItems);*/
                        var time;
                        for (var p = 0; p < $scope.commandClient[f + 1].commandItems.length; p++) {



                            /*   console.log('menuItems');
                             console.log($scope.menuItems);*/

                            time = new Date($scope.commandClient[f + 1].commandItems[p].created_at);


                            var size = $scope.commandClient[f + 1].commandItems[p].size;
                            var quantity = $scope.commandClient[f + 1].commandItems[p].quantity;
                            var status = $scope.commandClient[f + 1].commandItems[p].status;

                            /*
                             console.log('Notes')
                             console.log($scope.commandClient[f+1].commandItems[p].notes);*/

                            var notes = [];

                            if ($scope.commandClient[f + 1].commandItems[p].notes != "") {
                                try {
                                    notes = JSON.parse($scope.commandClient[f + 1].commandItems[p].notes);
                                }
                                catch (err) {
                                    //There was an error we flush the notes
                                    notes = [];
                                }
                            }

                            var extras = [];
                            if ($scope.commandClient[f + 1].commandItems[p].extras != "") {
                                try {
                                    extras = JSON.parse($scope.commandClient[f + 1].commandItems[p].extras);
                                }
                                catch (err) {
                                    //There was an error we flush the notes
                                    extras = [];
                                }
                            }

                            var commandLineId = $scope.commandClient[f + 1].commandItems[p].id;

                            $scope.commandClient[f + 1].commandItems[p] = angular.copy($.grep($scope.menuItems, function (e) {
                                return e.id == $scope.commandClient[f + 1].commandItems[p].item_id
                            })[0]);

                            var size_prices_array = JSON.parse($scope.commandClient[f + 1].commandItems[p]['size_prices_array']);

                            var size_names = $scope.commandClient[f + 1].commandItems[p]['itemtype']['size_names'];

                            var size_name_array = size_names.split(",");

                            //For each
                            var sizes = [];

                            for (var i = 0, len = size_name_array.length; i < len; i++) {

                                sizes.push(
                                    {
                                        name: size_name_array[i],
                                        price: size_prices_array[i],
                                        value: i + size_prices_array[i]
                                    }
                                )
                            }


                            $scope.commandClient[f + 1].commandItems[p].size = $.grep(sizes, function (e) {
                                return e.name == size
                            })[0];
                            $scope.commandClient[f + 1].commandItems[p].quantity = parseInt(quantity);
                            $scope.commandClient[f + 1].commandItems[p].notes = notes;
                            $scope.commandClient[f + 1].commandItems[p].extras = extras;

                            $scope.commandClient[f + 1].commandItems[p].time = time.getHours() + "H" + ((time.getMinutes().toString().length < 2) ? "0" : "") + time.getMinutes();


                            $scope.commandClient[f + 1].commandItems[p].command_id = $scope.commandClient[f + 1].id;
                            $scope.commandClient[f + 1].commandItems[p].command_line_id = commandLineId;
                            $scope.commandClient[f + 1].commandItems[p].status = status;

                        }
                        /*
                         $scope.commandClient[f + 1].status = "1";*/

                    }

                }
                else {

                    $scope.commandClient = [];
                    $scope.commandClient[$scope.commandCurrentClient] = {};
                    $scope.commandClient[$scope.commandCurrentClient].commandItems = [];

                }

                $scope.updateTotal();


                $timeout(function () {
                    $scope.progressValue = 100;
                    $('.progress-bar').addClass('progress-bar-success');
                    $scope.savingMessage = "Pret!!!"
                }, 0);

                console.log("The command as been loaded and confirmation received inside response - Success or Not ?");

                $scope.getBills();


            };

            postReq.send($url, $data, null, $callbackFunction);

        };

        /*Listener on window size to ajust layout*/
        $(window).on('resize', function () {
            if ($(window).width() > 768) {
                $('#sidebar-collapse').collapse('show');
                $('#sidebar-collapse2').collapse('show');
                $scope.showHeaderOptions = true
            }
        });
        $(window).on('resize', function () {
            if ($(window).width() <= 767) {
                $('#sidebar-collapse').collapse('hide');
                $('#sidebar-collapse2').collapse('hide');
                $scope.showHeaderOptions = false
            }
        });

        /*Start function for fullscreen*/
        function fullscreen() {
            splashFullScreen.fadeTo(0, 800, function () {
                splashFullScreen.css("visibility", "visible");
                splashFullScreen.css("font-size", "50px");
            });

            requestFullScreen();
            splashFullScreen.delay(300).fadeTo(800, 0, function () {
                splashFullScreen.css("visibility", "hidden");
                splashFullScreen.css("font-size", "30px");
            });

        }

        function requestFullScreen() {
            // Supports most browsers and their versions.
            var requestMethod = elem.requestFullScreen || elem.webkitRequestFullScreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;

            if (requestMethod) { // Native full screen.
                requestMethod.call(elem);
            } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }
        }

        function cancelFullScreen() {
            // Supports most browsers and their versions.
            var requestMethod = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msCancelFullscreen;

            if (requestMethod) { // Native full screen.
                requestMethod.call(document);
            } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }
        }

        /*End function for fullscreen*/

        /*This make magic for every table inside the plan canvas*/
        /**
         * @param canvas : The canvas object where to draw .
         *                 This object is usually obtained by doing:
         *                 canvas = document.getElementById('canvasId');
         * @param x     :  The x position of the rectangle.
         * @param y     :  The y position of the rectangle.
         * @param w     :  The width of the rectangle.
         * @param h     :  The height of the rectangle.
         * @param text  :  The text we are going to centralize
         * @param angle  :  The angle of the rectangle,to nullify with text number.
         */
        var paint_centered = function (canvas, x, y, w, h, text, angle) {
            // The painting properties
            // Normally I would write this as an input parameter
            var Paint = {
                RECTANGLE_STROKE_STYLE: '#222',
                RECTANGLE_LINE_WIDTH: 3,
                VALUE_FONT: '28px Arial',
                VALUE_FILL_STYLE: 'white'
            };

            // Obtains the context 2d of the canvas
            // It may return null
            var ctx2d = canvas.getContext('2d');

            if (ctx2d) {
                // draw rectangular
                ctx2d.strokeStyle = Paint.RECTANGLE_STROKE_STYLE;
                ctx2d.fillStyle = "#222";
                ctx2d.lineWidth = Paint.RECTANGLE_LINE_WIDTH;
                ctx2d.strokeRect(x, y, w, h);
                ctx2d.lineWidth = Paint.RECTANGLE_LINE_WIDTH + 2;

                var width,
                    height;

                /*If this is square, which also mean it is a plc and not a tbl*/
                /*This impact the number of seat*/
                if (w == h) {
                    width = w / 2;
                    height = h / 2;

                    /*Seats border background*/
                    /*Bottom*/
                    ctx2d.fillRect(x + w / 2 / 2, y + h * 1.1, width, height);

                    /*Top*/
                    ctx2d.fillRect(x + w / 2 / 2, y * 2.2, width, height);

                    /*Left*/
                    ctx2d.fillRect(x - (h / 2) * 1.2, -width / 2, height, width);

                    /*Right*/
                    ctx2d.fillRect(x + w / 2 + width * 1.2, -width / 2, height, width);
                    /*End Seats*/


                    ctx2d.fillStyle = "#333";
                    /*Seats*/
                    /*Bottom*/
                    ctx2d.fillRect(x + w / 2 / 2 + 2, y + h * 1.1 + 2, width - 4, height - 4);

                    /*Top*/
                    ctx2d.fillRect(x + w / 2 / 2 + 2, y * 2.2 + 2, width - 4, height - 4);

                    /*Left*/
                    ctx2d.fillRect(x - (h / 2) * 1.2 + 2, -width / 2 + 2, height - 4, width - 4);

                    /*Right*/
                    ctx2d.fillRect(x + w / 2 + width * 1.2 + 2, -width / 2 + 2, height - 4, width - 4);
                    /*End Seats*/
                }
                else {
                    width = w / 4;
                    height = h / 2;

                    /*Seats border background*/
                    /*Bottom*/
                    ctx2d.fillRect(x + w / 2 + width, y + h * 1.1, width, height);
                    ctx2d.fillRect(x + w / 2 / 2 + width / 2, y + h * 1.1, width, height);
                    ctx2d.fillRect(x + w / 2 / 2 - width, y + h * 1.1, width, height);

                    /*Top*/
                    ctx2d.fillRect(x + w / 2 + width, y * 2.2, width, height);
                    ctx2d.fillRect(x + w / 2 / 2 + width / 2, y * 2.2, width, height);
                    ctx2d.fillRect(x + w / 2 / 2 - width, y * 2.2, width, height);

                    /*Left*/
                    ctx2d.fillRect(x - (h / 2) * 1.2, -width / 2, height, width);

                    /*Right*/
                    ctx2d.fillRect(x + w / 2 + width * 2.2, -width / 2, height, width);
                    /*End Seats*/


                    ctx2d.fillStyle = "#333";
                    /*Seats*/
                    /*Bottom*/
                    ctx2d.fillRect(x + w / 2 + width + 2, y + h * 1.1 + 2, width - 4, height - 4);
                    ctx2d.fillRect(x + w / 2 / 2 + width / 2 + 2, y + h * 1.1 + 2, width - 4, height - 4);
                    ctx2d.fillRect(x + w / 2 / 2 - width + 2, y + h * 1.1 + 2, width - 4, height - 4);

                    /*Top*/
                    ctx2d.fillRect(x + w / 2 + width + 2, y * 2.2 + 2, width - 4, height - 4);
                    ctx2d.fillRect(x + w / 2 / 2 + width / 2 + 2, y * 2.2 + 2, width - 4, height - 4);
                    ctx2d.fillRect(x + w / 2 / 2 - width + 2, y * 2.2 + 2, width - 4, height - 4);

                    /*Left*/
                    ctx2d.fillRect(x - (h / 2) * 1.2 + 2, -width / 2 + 2, height - 4, width - 4);

                    /*Right*/
                    ctx2d.fillRect(x + w / 2 + width * 2.2 + 2, -width / 2 + 2, height - 4, width - 4);
                    /*End Seats*/
                }


                // draw text (this.val)
                ctx2d.textBaseline = "middle";
                ctx2d.font = Paint.VALUE_FONT;
                ctx2d.fillStyle = Paint.VALUE_FILL_STYLE;
                // ctx2d.measureText(text).width/2
                // returns the text width (given the supplied font) / 2
                var textX = x + w / 2 - ctx2d.measureText(text).width / 2;
                var textY = y + h / 2;
                ctx2d.rotate(-angle);
                ctx2d.fillText(text, textX, textY);
            } else {
                // Do something meaningful
            }
        }


    });
