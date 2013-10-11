API_URI = "http://smapps.smartmodule.net/SMPanel/api/";

$(document).ready(function () {
    // Synchronous
    var data = JSON.parse(
        $.ajax({
            url: (API_URI + "getContacts.php?firstLoad=1"),
            method: "GET",
            dataType: "json",
            crossDomain: true,
            async: false
        }).responseText
    );
    initialLoadComplete(data);
    createTabNew();
    hideAuthTabs();
	// Translate UI
	$('.edit-groups').innerHTML = translate('smpanel.app.phone_index.edit_groups');
	$("a[href='#tab-all']").innerHTML = translate('smpanel.app.phone_index.all_stuff');
	$('#save').innerHTML = translate('smpanel.app.phone_index.apply');
	$('#no').innerHTML = translate('smpanel.app.phone_index.cancel');
	$('#json-info-group').innerHTML = translate('smpanel.app.phone_index.group');
	$('#json-info-name').innerHTML = translate('smpanel.app.phone_index.name');
	$('#json-info-phone').innerHTML = translate('smpanel.app.phone_index.phone');
	$('#json-info-mail').innerHTML = translate('smpanel.app.phone_index.mail');
	$('#json-info-position').innerHTML = translate('smpanel.app.phone_index.position');
	$('#json-info-department').innerHTML = translate('smpanel.app.phone_index.department');
	$('#send').innerHTML = translate('smpanel.app.phone_index.send');
	$('#cancel-message').innerHTML = translate('smpanel.app.phone_index.cancel');
	$('#subject-p').innerHTML = translate('smpanel.app.phone_index.subject');
	$('#text-p').innerHTML = translate('smpanel.app.phone_index.message');
});

// Use this as a substitute for console.log on the SM device
function access_log(val)
{
    $.ajax({
        url: API_URI + "ACCESS_LOG_" + val,
        method: "GET",
        dataType: "json"
    });
}

function initialLoadComplete(data) {

    createTable(data);
    $("#tabs").tabs();

    //Attach event handlers
    $(".tab").each(function () { this.addEventListener("click", tabClick, false) });
    $("#call").each(function () { this.addEventListener("click", togglePhoneCall, false); });
    $("#message").each(function () { this.addEventListener("click", ShowMessagePopUp, false); });
    $("#send").each(function () { this.addEventListener("click", sendMessage, false); });
    $("#cancel-message").each(function () { this.addEventListener("click", hideContactInfo, false); });
    $('.pop-up-x, #no').click(function (e) { e.stopPropagation(); hideContactInfo(); });
    $('.popup').click(function (e) { e.stopPropagation(); hideContactInfo(); });
    $('.popup-panel').click(function (e) { e.stopPropagation(); });
    $(".edit-groups").click(editGroups);
    $(".content-holder:first").css('margin-top', '180px');
    $('#check-is-internal').attr("data-clicked", "0");
    $('#check-is-internal').click(checkClick);
    
}

function checkClick() {
    if ($('#check-is-internal').css("background-image").indexOf("unchek") != -1) {
        $('#check-is-internal').css("background-image", "url(images/chek2.png)");
        $('#check-is-internal').attr("data-clicked", "1");
    }
    else {
        $('#check-is-internal').css("background-image", "url(images/unchek.png)");
        $('#check-is-internal').attr("data-clicked", "0");
    }
};

var lastBodyScroll = 0;

function isAuthenticated()
{
    var response = $.ajax({
        url: API_URI + "isAuthenticated.php",
        method: "GET",
        dataType: "json",
        withCredentials: "true",
        async: false
    }).responseText;
    return (response == "1" ? true : false);
}

function hideAuthTabs()
{
    if (!isAuthenticated())
    {
        $(".edit-button, .add-user, #new-tab, .tab-deleted, .edit-groups").css("display", "none");
        $("#head-name").css("margin-left","20%")
    }
}

function createTable(json)
{
    JSONobject = json;
    
    JSONobject.contacts.sort(
        function (a, b) {
            return (a.name < b.name) ? -1 : (a.name == b.name ? 0 : 1);
        });


    var offSet = { value: 15 };
    var offSetPopUptabs = { value: 3 };

    createTableHead(document.getElementById("tab-all"));
    for (var i = 0; i < JSONobject.groups.length  ; i++) {
        createTabElements(i, offSet, JSONobject.groups);
        createTableHead(document.getElementById("tab-" + i));
    }
    createTableContent(JSONobject);
    createAlphabetLetters(document.getElementById("tab-all"), JSONobject);
    for (var i = 0; i < JSONobject.groups.length ; i++) {
        createAlphabetLetters(document.getElementById("tab-" + i), JSONobject);
        createPopUpGroups(i, offSetPopUptabs, JSONobject.groups);
    }
    $(".tab-pp").each(function () { this.addEventListener("click", popUpTabClick, false) });
    $("#groups :first-child").addClass("tab-selected");
    
    $(window).scroll(function() {
        var bodyElement = $("body");
        var bodyScroll = bodyElement.scrollTop();
        if(Math.abs(bodyScroll - lastBodyScroll) < 30)
            return;
        lastBodyScroll = bodyScroll;
        var activeTabId = $(".tab-selected > a").attr("href");
        var activeElements = $(activeTabId + " > .content-holder").children();
        var bestFitElement = null;
        var bestFitDistance = bodyElement.height();
        for(i = 0; i < activeElements.length; i++)
        {
            var distance = Math.abs((bodyScroll + 210)  - ($(activeElements[i]).offset().top));
            if( (distance) < bestFitDistance)
            {
                bestFitElement = activeElements[i];
                bestFitDistance = distance;
            }
        }
        // Select the active marker
        if(bestFitElement != null)
        {
            var activeBookmarks = $(activeTabId + " > .div-chars > .char-groups").children();
            $(".selected-bookmark").each( function(){ this.classList.remove("selected-bookmark"); } );
            for(j = 0; j < activeBookmarks.length; j++)
            {
                if(activeBookmarks[j].innerHTML[0]  == $(bestFitElement).attr("data-contact-name")[0])
                {
                    activeBookmarks[j].classList.add("selected-bookmark");
                    return;
                }
            }
        }
    });
    // Scroll to top
    $('html, body').animate({
         scrollTop: 0
     }, 500);
}

function createTabNew() {
    var newTabTextValue = translate('smpanel.app.phone_index.new');
        
    var ul = document.getElementById("groups");
    var newTab = document.createElement("li");
    newTab.className = "tab";
    newTab.id = "new-tab";
    $(ul).append(newTab);
    var a = document.createElement("a");
    a.id = "newTab-a";
    newTab.appendChild(a);
    a.innerHTML = newTabTextValue;
    var input = document.createElement("input");
    input.className = "li-input";
    input.id = "input-new";
    input.style.display = "none";
    input.value = newTabTextValue;
    input.onfocus = function() { this.value = ""; };
    newTab.appendChild(input);
}

// Used internally by TabClick or programatically
function tabClickNoEvent(tab)
{
    var id = tab.id;
    var tabIndex = id.match("[0-9]+");
    tabIndex = (tabIndex == null) ? 0 : 1 + parseInt(tabIndex[0]);   
    destroyTable();
    $.ajax({
        url: (API_URI + "getContacts.php"),
        method: "GET",
        dataType: "json",
        crossDomain: true,
        success: function (data) {
            createTable(data);
            markTabSelected($("#" + id).first());
            $("#tabs").tabs("refresh");
            $("#tabs").tabs("option", "active", tabIndex);
            $(".tab").each(function () { this.addEventListener("click", tabClick, false) });
            createTabNew();
            hideAuthTabs();
            $.each($(".all-tabs"), function (index, value) { $(value).find(".content-holder:first").css('margin-top', '180px'); });
        }
    });
}

function tabClick(event)
{
    event.stopPropagation();
    tabClickNoEvent(event.currentTarget);
}

function popUpTabClick() {
    var a = $(this).children(":first");
    $("#edit-group").val(a.html());
    $("#edit-group").attr("data-group-id", a.attr("data-group-id"));
}

function deviceCheck() {
    if (navigator.userAgent.indexOf("Linux i686") != -1) {
        $("#right-controller").css("display","none");
        $.ajax({
            url: (API_URI + "checkIsNurseDevice.php"),
            method: "GET",
            dataType: "text",
            success: function(data) {
                if (data != 1) {
                    // Patient device
                    $("#headbar").css("display", "none");
                    $("#header, #groups, .char-groups, .table, #main").css("width", (1024 + 115) + "px");
                }
            }
        });
    }
}

function modifyGroup(index, id, oldName)
{
    if (oldName != "Deleted")
    {
        var newName = $("#input" + index).val();
        if (newName.length > 0 && newName != oldName)
        {
            $.ajax({
                url: (API_URI + "modifyGroup.php"),
                method: "POST",
                dataType: "json",
                data: { "id": id, "name": newName },
                async: false,
                success: function (data) {
                    if (data != 1) {
                        alert("error completing request");
                    }
                    
                }
            });
        }
    }
}

function createGroup(oldName) {
    var newName = $("#input-new").val();
    if (newName.length > 0 && newName != oldName)
    {
        $.ajax({
            url: (API_URI + "createGroup.php"),
            method: "POST",
            dataType: "json",
            data: { "name": newName },
            async: false,
            success: function (data) {
                if (data != 1) {
                    alert("error completing request");
                }
            }
        });
    }
}

function createPopUpGroups(index, offSetPopUptabs, groups) {

    var ulEditPopUp = document.getElementById("pop-up-groups");
    var liPP = document.createElement("li");
    liPP.className = "tab-pp";
    if (groups[index].name == "Deleted") {
        liPP.id = "deleted-pp";
    }
    else {
        liPP.style.left = offSetPopUptabs.value + "em";
        offSetPopUptabs.value = offSetPopUptabs.value + 8;
    }
    ulEditPopUp.appendChild(liPP);
    var aPopUp = document.createElement("a");
    liPP.appendChild(aPopUp);
    aPopUp.innerHTML = groups[index].name;
    aPopUp.setAttribute("data-group-id", groups[index].id);
}

function editGroups() {
    // Preserve old names to detect changed tabs
    var oldGroupNames = $.map($("#groups .li-input:lt(-1)"), function (value, index) { return $(value).val(); });
    var oldNewName = $("#input-new").val();

    $("#groups").children().slice(1).children().hide();
    $(".li-input").each(function(index, value) {
        if ($(value).val() != "Deleted") {
            $(value).css("display", "inline");
        }
    });
    $(".edit-groups").html("Save Groups");
    $(".tab").each(function () { this.removeEventListener("click", tabClick, false) });
    $(".edit-groups").off("click");
    $(".edit-groups").click(function () {
        // Synchronous calls
        $.each($("#groups .li-input:lt(-1)"), function(index, value) {
            // Deleted group is not editable
            if (oldGroupNames[index] != "Deleted") {
                modifyGroup(index, $(value).parent().attr("data-group-id"), oldGroupNames[index]);
            }
        });
        createGroup(oldNewName);

        // Reset names
        $.each($("#groups .li-input"), function(index, value) { $(value).val($(value).prev().html()); });
        $("#groups a").show();
        $("#groups .li-input").hide();
        $(".edit-groups").html("Edit Groups");
        $(".tab").each(function () { this.addEventListener("click", tabClick, false) });
        $(".edit-groups").off("click");
        $(".edit-groups").click(editGroups);

        // Update layout after changes
        //$(".tab-selected").click();
        tabClickNoEvent($(".tab-selected")[0]);
    });
}

//Event handler for tab selection
function markTabSelected(selectedTab) {
    // Unselect old tabs
    $(".tab-selected").each(function () { this.classList.remove("tab-selected") });
    // Select the new tab
    selectedTab.addClass("tab-selected");
}

function destroyTable()
{
    $(".tab").slice(1).remove();
    $("#tabs").children().slice(2).remove();
    $("#tabs").children(":nth-child(2)").empty();
}
    
function createTableHead(parent) {
    //table Head

    var tableDiv = document.createElement("div");
    tableDiv.className = "table";
    parent.appendChild(tableDiv);

    var tableRow = document.createElement("div");
    tableRow.className = "table-row";
    tableDiv.appendChild(tableRow);

    var tableHead = document.createElement("div");
    tableHead.className = "table-head";
    tableRow.appendChild(tableHead);
    var button = document.createElement("div");
    button.className = "add-user";
    button.addEventListener("click", showContactInfo, false);
    tableHead.appendChild(button);
    var butonText = document.createElement("a");
    butonText.id = "button-text";
    button.appendChild(butonText);
    butonText.appendChild(document.createTextNode(translate('smpanel.app.phone_index.add')));
    var headP = document.createElement("p");
    headP.className = "head-p";
    headP.id = "head-name"
    tableHead.appendChild(headP);
    headP.appendChild(document.createTextNode("Name"));

    var tableHeadFour = document.createElement("div");
    tableHeadFour.className = "table-head";
    tableRow.appendChild(tableHeadFour);
    var headPFour = document.createElement("p");
    headPFour.className = "head-p";
    tableHeadFour.appendChild(headPFour);
    headPFour.appendChild(document.createTextNode("Phone"));

    var tableHeadTwo = document.createElement("div");
    tableHeadTwo.className = "table-head";
    tableRow.appendChild(tableHeadTwo);
    var headPTwo = document.createElement("p");
    headPTwo.className = "head-p";
    tableHeadTwo.appendChild(headPTwo);
    headPTwo.appendChild(document.createTextNode("Position"));


    var tableHeadTree = document.createElement("div");
    tableHeadTree.className = "table-head";
    tableRow.appendChild(tableHeadTree);
    var headPTree = document.createElement("p");
    headPTree.className = "head-p";
    tableHeadTree.appendChild(headPTree);
    headPTree.appendChild(document.createTextNode("Department"));

    deviceCheck();
}

//function findById(array, id) {
//    return array.filter(function (item) { return item.id == id; })[0];
//}

//Create table content
function createTableContent(json) {
    var isAuth = isAuthenticated();
    for (var i = 0; i < json.contacts.length; i++) {
        if (!isAuth && json.contacts[i].isInternal == "1") {
            continue;
        }

        var holder = $("<div>");
        holder.addClass("content-holder");
        $("#tab-all").append(holder);
        createTableRow(holder, json.contacts[i], "", json);
        for (var j = 0; j < json.groups.length; j++) {
            if (!isNaN(parseInt(json.contacts[i].group))) {
                if (json.groups[j].id == json.contacts[i].group)
                {
                    var holder = $("<div>");
                    holder.addClass("content-holder");
                    $("#tab-" + j).append(holder);            
                    createTableRow(holder, json.contacts[i], j, json);
                    // Add group ID and name to the edit button on the main tab
                    $("#tab-all .edit-button").last()
                        .attr("data-group-id", json.groups[j].id)
                        .attr("data-group-name", json.groups[j].name);
                }
            }
            // Add group ID to its non-popup tab
            $($("#groups li")[j + 1]).attr("data-group-id", json.groups[j].id);
        }
    }
}

function createTableRow(parent, contact, contactGroupIndex, json)
{
    parent = parent[0];

    var tableContent = document.createElement("div");
    tableContent.className = "table-content";

    tableContent.setAttribute("data-contact-id", contact.id);
    tableContent.setAttribute("data-contact-name", contact.name);
    tableContent.setAttribute("data-contact-position", contact.position);
    tableContent.setAttribute("data-contact-department", contact.department);
    tableContent.setAttribute("data-contact-phone", contact.phone);
    tableContent.setAttribute("data-contact-mail", contact.mail);
    tableContent.setAttribute("data-group-id", contact.group);
    tableContent.setAttribute("data-is-internal", contact.isInternal);
    var editHolder = document.createElement("div");
    editHolder.className = "edit-holder";
    tableContent.appendChild(editHolder);
    var editButton = document.createElement("div");
    editButton.className = "edit-button";
    editButton.setAttribute("data-contact-id", contact.id);
    editButton.setAttribute("data-contact-name", contact.name);
    editButton.setAttribute("data-contact-position", contact.position);
    editButton.setAttribute("data-contact-department", contact.department);
    editButton.setAttribute("data-contact-phone", contact.phone);
    editButton.setAttribute("data-contact-mail", contact.mail);
    editButton.setAttribute("data-is-internal", contact.isInternal);
    if (!isNaN(parseInt(contactGroupIndex)))
    {
        editButton.setAttribute("data-group-id", json.groups[contactGroupIndex].id);
        editButton.setAttribute("data-group-name", json.groups[contactGroupIndex].name);
    }
    editButton.addEventListener("click", showContactInfo, false);
    var editText = document.createElement("a");
    editText.id = "edit-text";
    editText.appendChild(document.createTextNode(translate('smpanel.app.phone_index.edit')));
    editButton.appendChild(editText);
    editHolder.appendChild(editButton);
    
    var tableCellOne = document.createElement("div");
    tableCellOne.className = "table-cell";
    tableCellOne.addEventListener("click", showContactInfo, false);
    
    var img = document.createElement("img");
    img.className = "photo";
    img.setAttribute('src', '../../admin/images/user_icon.png');
    tableCellOne.appendChild(img);

    var cellPTree = document.createElement("p");
    cellPTree.className = "cell-p";
    cellPTree.appendChild(document.createTextNode(contact.name));
    tableCellOne.appendChild(cellPTree);
    tableContent.appendChild(tableCellOne);
        

    var tableCellFour = document.createElement("div");
    tableCellFour.className = "table-cell";
    tableCellFour.addEventListener("click", showContactInfo, false);
    var cellPFour = document.createElement("p");
    cellPFour.className = "cell-p";
    cellPFour.appendChild(document.createTextNode(contact.phone));
    tableCellFour.appendChild(cellPFour);
    tableContent.appendChild(tableCellFour);
    var imgCall = document.createElement("img");
    imgCall.className = "img-call";
    imgCall.setAttribute('src', 'images/slushalka.png');
    tableCellFour.appendChild(imgCall);

    var tableCellTwo = document.createElement("div");
    tableCellTwo.className = "table-cell";
    tableCellTwo.addEventListener("click", showContactInfo, false);
    var cellPOne = document.createElement("p");
    cellPOne.className = "cell-p";
    cellPOne.appendChild(document.createTextNode(contact.position));
    tableCellTwo.appendChild(cellPOne);
    tableContent.appendChild(tableCellTwo);

    var tableCellTree = document.createElement("div");
    tableCellTree.className = "table-cell";
    tableCellTree.addEventListener("click", showContactInfo, false);
    var cellPTwo = document.createElement("p");
    cellPTwo.className = "cell-p";
    cellPTwo.appendChild(document.createTextNode(contact.department));
    tableCellTree.appendChild(cellPTwo);
    tableContent.appendChild(tableCellTree);

    parent.appendChild(tableContent);
}
    
function createTabElements(index, offSet, groups)
{
    var ul = document.getElementById("groups");
    var li = document.createElement("li");
    li.className = "tab";
    li.id = "li-tab-" + index;
    // Deleted group workaround
    if (groups[index].name == "Deleted")
    {
        li.className += " tab-deleted";
    }
    else
    {
        li.style.left = offSet.value + "em";
        offSet.value = offSet.value + 8;
    }
    ul.appendChild(li);

    var a = document.createElement("a");
    li.appendChild(a);
    a.href = "#tab-" + index;
    a.innerHTML = groups[index].name;

    var input = document.createElement("input");
    input.className = "li-input";
    input.id = "input" + index;
    input.style.display = "none"
    input.value = groups[index].name;
    li.appendChild(input);

    var tabs = document.getElementById("tabs");
    var div = document.createElement("div");
    div.id = "tab-" + index;
    div.className = "all-tabs";
    tabs.appendChild(div);
}

function createAlphabetLetters(parent, json, offset)
{
    var offset = 3;
    var charDiv = document.createElement("div");
    charDiv.className = "div-chars"
    //parent.appendChild(charDiv);
    $(parent).prepend(charDiv);
    var ul = document.createElement("ul");
    ul.className = "char-groups";
    charDiv.appendChild(ul);
    var phoneImg = document.createElement("img");
    phoneImg.id = "phone-img";
    ul.appendChild(phoneImg);
    phoneImg.setAttribute('src', "images/in_phone.png");
    var letters =
        $.map($(parent).children(".content-holder").children(".table-content").children(":nth-child(2)").children("p"),
                    function (item) { return item.innerHTML[0]; });
    letters = (function (array) { return array.filter(function(el,index,arr) { return arr.indexOf(el) == index; }) })(letters);
    $.unique(letters).sort();
       
    
    for (var i = 0; i < letters.length; i++) {
        var aChar = document.createElement("a");
        aChar.id = "a-" + i
        ul.appendChild(aChar);     
        aChar.appendChild(document.createTextNode(letters[i]));
        //aChar.href = "#";
        aChar.className = "bookmark";
        aChar.style.marginLeft = offset + "px";
        offset += 1;
        aChar.addEventListener("click", scrollToContacts, false);

    }
}

function scrollToContacts()
{
    var elements = $(".content-holder").children(".table-content").children(":nth-child(2)").children("p");

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].innerHTML[0] == this.innerHTML[0])
        {
            //$(".content-holder").scrollTo($(elements[i]), 900);
            $('html, body').animate({
                scrollTop: $(elements[i]).offset().top - 230
            }, 500);
            //elements[i].scrollIntoView(false);
            //$(elements[i]).goTo();
            return;
        }

    }
}

function showContactInfo(event) {
    event.stopPropagation();
    // Get data for contact
    var contactId = $(this).attr("data-contact-id");
    var contactName = $(this).attr("data-contact-name");
    var contactPosition = $(this).attr("data-contact-position");
    var contactDepartment = $(this).attr("data-contact-department");
    var contactPhone = $(this).attr("data-contact-phone");
    var contactMail = $(this).attr("data-contact-mail");
    var contactGroup = $(this).attr("data-group-name");
    var contactGroupId = $(this).attr("data-group-id");
    var contactIsInternal = $(this).attr("data-is-internal");
    if (this.className == "edit-button") {
        $("#edit-contact-id").val(contactId);
        var departmentNames = [];
        var activeTabId = $(".tab-selected > a").attr("href");
        $(activeTabId + " > .content-holder").children(".table-content").each(function(){ departmentNames.push($(this).attr("data-contact-department")); });
        $("#edit-department").val(contactDepartment);
        $("#edit-department").autocomplete({
            source: departmentNames,
            open: function() {
                var position = $("#edit-department").position(),
                    left = position.left, top = position.top;

                $("#edit-department > ul").css({left: left + 20 + "px",
                    top: top + 4 + "px" });

            }
        });
        $("#edit-position").val(contactPosition);
        $("#edit-name").val(contactName);
        $("#edit-phone").val(contactPhone);
        $("#edit-mail").val(contactMail);
        $("#edit-group").val(contactGroup);
        $("#edit-group").attr("data-group-id", contactGroupId);
        var groupNames = [];
        $(".tab > a").each(function(){ groupNames.push(this.innerHTML); });
        $("#edit-group").autocomplete({
            source: groupNames,
            position: { my : "right top", at: "right bottom" }
        });
        $("#save").unbind('click').click(editContact);

        // Flip the checkbox if needed
        var checkBoxCss = $("#check-is-internal").css("background-image");
        if (((checkBoxCss.indexOf("unchek") == -1) && (contactIsInternal == "0")) ||
            ((checkBoxCss.indexOf("unchek") != -1) && (contactIsInternal == "1"))) {
            checkClick();
        }
    }
    else
    {
        // Get data for contact
        contactName = $(this).parent().attr("data-contact-name");
        contactPosition = $(this).parent().attr("data-contact-position");
        contactDepartment = $(this).parent().attr("data-contact-department");
        contactPhone = $(this).parent().attr("data-contact-phone");
        // Update popup information
        $("#position").text(contactPosition);
        $("#department").text(contactDepartment);
        $("#name").text(contactName);
        $("#call").attr("data-phone", contactPhone);
        $("#send").attr("data-mail", $(this).parent().attr("data-contact-mail"));
        $("#edit-contact-id, #edit-department, #edit-position, #edit-name, #edit-phone, #edit-mail, #edit-group, #message-text, #subject").val("");
        $("#save").unbind('click').click(createContact);
    }
    // Show popup
    if(this.className == "edit-button" || this.className == "add-user")
        $('#big-pp').show('drop', 500);
    else
        $('#contactInfoPopup').show('drop', 500);
}

function contactsSuccesfunction(data) {
    if (data != 1) {
        alert("error complite request");
    }
    hideContactInfo()
    if (data == 1) {
        /*
          Hall of shame
          Here are attempts to invoke tabCLick() which did not do it on the device:
          --------------------
          $(".tab-selected").click();
          --------------------
          $(".tab-selected").trigger("click");
          --------------------
          $(".tab-selected").trigger($.Event("click"));
          --------------------
          var currentSelectedIndex = $(".tab").get().indexOf($(".tab-selected")[0]);
          window.location.reload();
          $($(".tab")[currentSelectedIndex]).addClass("tab-selected");
          --------------------
          var e = new MouseEvent("click");
          $(".tab-selected")[0].dispatchEvent(e);
          --------------------
          tabClick.call($(".tab-selected")[0], new MouseEvent("click"));
          --------------------
          --------------------
          And here is how it came to be:
        */
        tabClickNoEvent($(".tab-selected")[0]);
    }
}

function createContact(event) {
    event.stopPropagation();

    var contactData = JSON.stringify({
        "name": $("#edit-name").val(),
        "position": $("#edit-position").val(),
        "department": $("#edit-department").val(),
        "phone": $("#edit-phone").val(),
        "mail": $("#edit-mail").val(),
        "group": $("#edit-group").val(),
        "isInternal": $("#check-is-internal").attr("data-clicked")
    });

    $.ajax({
        url: (API_URI + "createContact.php"),
        method: "POST",
        dataType: "json",
        data: { "contactData": contactData },
        xhrFields: {
            withCredentials: true
        },
        success: contactsSuccesfunction
    });
}

function editContact(event) {
    event.stopPropagation();

    var contactData = JSON.stringify({
        "id": $("#edit-contact-id").val(),
        "name": $("#edit-name").val(),
        "position": $("#edit-position").val(),
        "department": $("#edit-department").val(),
        "phone": $("#edit-phone").val(),
        "mail": $("#edit-mail").val(),
        "group": $("#edit-group").attr("data-group-id"),
        "isInternal": $("#check-is-internal").attr("data-clicked")
    });

    $.ajax({
        url: (API_URI + "modifyContact.php"),
        method: "POST",
        dataType: "json",
        data: { "contactData": contactData },
        xhrFields: {
            withCredentials: true
        },
        success: contactsSuccesfunction
    });
}
function hideContactInfo() {
    $('#contactInfoPopup, #big-pp, #message-pp').hide();
}
function ShowMessagePopUp() {
    $("#message-pp").show();

}

function messageResult(data) {
    if (data == 1) {
        alert(translate('smpanel.app.phone_index.mail_sent'));
    }
    else
    {
        alert(translate('smpanel.app.phone_index.unable_to_send'));
    }
    hideContactInfo();
}

function sendMessage() {
    var mail = $(this).attr("data-mail");
    var subject = $("#subject").val();
    var textMail = $("#message-text").val();

    $.ajax({
        url: (API_URI + "sendMessage.php"),
        method: "POST",
        dataType: "json",
        data: { "to": mail, "subject" : subject, "message" : textMail },
        success: messageResult
    });

}
    
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// This function is called from the SM dveice to register change in state
function updatePhoneState(state) {
    //0 - state idle;
    //1 - incoming call;
    //2 - outgoing call;
    //3 - in call;
    //4 - hold;
    if(state == 0 && document.getElementById("call").classList.contains("call-red")) // Is Red and status changes to idle
    {
        document.getElementById("call").classList.add("call-green");
        document.getElementById("call").classList.remove("call-red");
    }
}

function togglePhoneCall() {
    if (document.getElementById("call").classList.contains("call-green")) {
        document.getElementById("call").classList.remove("call-green");
        document.getElementById("call").classList.add("call-red");

        Phone.dialNumber($("#call").attr("data-phone"));
    }
    else {
        document.getElementById("call").classList.add("call-green");
        document.getElementById("call").classList.remove("call-red");

        Phone.hangUp();
    }
}

function translate(key)
{
	var trans = $.ajax({
		data: { "key": key },
		url: API_URI + "translate.php",
		type: "GET",
		dataType: "text",
		crossDomain: true,
		async: false
	}).responseText;
	return ((trans.length > 0) ? trans : key);
}
