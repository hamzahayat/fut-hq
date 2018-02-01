//Cache Selectors
var $username = $("#inputUsername");
var $password = $("#inputPassword");
var $loginBtn = $("#login-btn");
var $registerBtn = $("#register-btn");
var $errorTitle = $("#error-title");
var $errorMssg = $("#error-mssg");
var $playerListPage = $("#playerListPage");
var $window = $(window);
var chartID = "";

//Event that generates Splash Screen
$(document).on('pagecreate', "#splash-screen1", function (e) {

    //Create Click Function to Register 
    $registerBtn.click(function () {
        localStorage.setItem($username.val(), $password.val());

        $errorTitle.text("Welcome " + $username.val());
        $errorMssg.text("You have been registered.");

    });

    //Login
    $loginBtn.click(function () {
        //If no past username or password are saved
        if (localStorage.length < 1) {

            $errorTitle.text("Please Register");
            $errorMssg.text("Register an account to continue.");

        }
        //Successful Login            
        else if (localStorage.getItem($username.val()) === $password.val()) {

            //Redirect to Next Page by Changing and Removing attributes
            $loginBtn.attr({
                "href": "#playerListPage",
                "data-rel": " ",
                "data-position-to": " ",
                "data-role": " ",
                "data-inline": " ",
                "data-transition": "slide"
            });
            $("body").css("background-image", 'none');
            $("#avatar-name").text($username.val()).css("textTransform", "capitalize");
        }
        //Unsuccessful Login            
        else if (localStorage.getItem($username.val()) !== $password.val()) {

            $errorTitle.text("Please Try Again");
            $errorMssg.text("Incorrect Username or Password");
        }
    });

    //Create Function to Center Login Card
    function centerLogin() {
        var $login = $("#login");

        var toppos = (($window.height() / 2) - ($login.height() / 2));
        var leftpos = (($window.width() / 2) - ($login.width() / 2));

        $login.css({
            "top": toppos,
            "left": leftpos
        });
    }

    //Run centerLogin()
    $window.on('resize load', function () {
        centerLogin();
    });

    // for (var i = 1; i <= 100; i++) {
    // var url = "https://easports.com/fifa/ultimate-team/api/fut/item?page=" + i;

    //}

    //Create Ajax call
    $.ajaxSetup({
        url: "playersInfo.json",
        dataType: 'json',
        cache: false,
        type: 'GET',
        global: false,
        timeout: 60000,
        success: processJSON,
        error: function () {
            $("#list").text("Error, could not load JSON");
        }
    });

    $.ajax();
});

//Event That Generates List of Players
$(document).on('pagebeforecreate', '#playerListPage', function () {
    //Create Bio Page when element is clciked
    $(".li-player").click(function (event) {

        var clickedPlayer = $(this).attr("data-playerNum");
        $.ajax({
            success: function (data) {
                generateBioPage(data, clickedPlayer);
            }
        });
    });
});

//Create JSON Parser function
function processJSON(json) {

    //Cache Selectors
    var $list = $("#list");
    var $playerBioPage = $("#playerBioPage");

    //Create JSON Object
    var playerArray = json.items;

    //Create Empty String for li element 
    var li = "";

    playerArray.forEach(function (player, index) {
        var playerID = player.lastName.split(" ").join("") + player.id;
        var playerBioID = player.id;
        li = "<li class = 'li-player' id='" + playerID + "' data-playerNum ='" + index + "' ><a title='" + player.rating + " " + player.firstName + " " + player.lastName + "' class='more-info' href='#playerBioPage'>";
        //Insert Player Image
        li += "<img src='" + player.headshotImgUrl + "' class='ui-thumbnail ui-thumbnail-circular' />";
        //Insert Player Name
        li += "<h2><em>" + player.rating + "</em> | " + player.firstName + " " + player.lastName + "</h2>";
        //Insert Player Bio
        li += "<p><strong>" + player.club.name + "</strong></p>";
        li += "</a></li>";

        //Add Player in li element to List
        $list.append(li);
    });
}

//Create Function that draws the Stat Chart for Players
function createChart(json, clickedPlayer) {
    var player = json[clickedPlayer];

    //Create Data Object
    var data = {
        labels: ["Pace", "Shooting", "Passing", "Dribbling", "Defending", "Physical"],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'],
            borderWidth: 1
        }]
    };

    //Pass Information into Graph
    var attributes = player.attributes;

    attributes.forEach(function (item) {
        data.datasets[0].label = player.firstName + " Stats";
        data.datasets[0].data.push(parseInt(item.value));
    });

    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: false
        }
    });

    $("#myChart").attr({
        'width': "350",
        'height': "250"
    });
}

//Create Function that generates Bio Page for players
function generateBioPage(json, clickedPlayer) {

    //Create JSON Object
    var playerArray = json.items;
    var index = parseInt(clickedPlayer);

    var player = playerArray[index];
    var $playerBioPage = $("#playerBioPage");

    //Set Page Title
    $playerBioPage.find("h1").text(player.rating + " | " + player.lastName);
    //Set Club Name and Image
    $("#club-img").attr("src", player.club.imageUrls.dark.small);
    $("#club-name").text(player.club.name);
    //Set Nationality
    $("#nation-img").attr("src", player.nation.imageUrls.small);
    $("#nation-name").text(player.nation.name);
    //Set Player Information
    $("#player-rating").text(player.rating);
    $("#player-position").text(player.position);
    $("#player-height").text(parseInt(player.height) + ' meters');
    $("#player-weight").text(player.weight + ' Kg');
    $("#player-age").text(player.age);

    createChart(playerArray, index);
}