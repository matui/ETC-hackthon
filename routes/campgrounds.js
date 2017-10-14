var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
let {etcs,interchanges} = require('../storage.js')


//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    console.log('------------------')
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var start_point = req.body.start_point
    var destination = req.body.destination
    var vehicle_type = req.body.vehicle_type
    var road_type = req.body.road_type
    var fee = req.body.fee
    var road_description = req.body.road_description
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var direction = req.body.direction
    var newCampground = {fee: fee, direction: direction, start_point: start_point, destination: destination, road_type: road_type, vehicle_type: vehicle_type, description: desc, author:author}
    console.log('=================================')
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            //res.redirect("/campgrounds");
            //res.redirect('/traffic/' + start_point + '/' + destination + '/S')
            res.redirect("/campgrounds");
        }
    });
});


//road - show form to create new campground
router.get("/searchTraffic/:from/:to", function(req, res){
    let {from,to} = req.params
    console.log(`Get traffic query from ${from} to ${to}`)
    let result =[]
    let miles = []
    let current = undefined
    let direction = undefined
    let stations = []
    let next = ''
    for(var i in interchanges[from]){
        let {mileage} = interchanges[from][i]
	      direction = interchanges[from][i].direction
	      for(var j in interchanges[to]){
	          if (direction == 'S'){
		            if(mileage >= interchanges[to][j].mileage)
		                continue
	          } else {
		            if(mileage <= interchanges[to][j].mileage)
		                continue
	          }
            current = interchanges[from][i].id
            break
        }
        if(current) break
    }
    do{
        stations.push(etcs[current].From)
        Object.keys(etcs[current].data).forEach((i)=>{
        if(etcs[i].Direction == direction && etcs[i].Road == etcs[current].Road)
            next = i
        })
        if(!next||stations.length > 30) break
        let length = Number(Math.abs(etcs[current].Mileage - etcs[next].Mileage).toFixed(1))
        result.push(etcs[current].data[next])
        miles.push(length)
        current = next
    } while (current && etcs[current].To != to)
    stations.push(to)
    console.log(JSON.stringify(stations))


    let small_car = 0
    let small_car_count = 0.0
    let count1 = 0
    let small_van = 0
    let small_van_count = 0.0
    let count2 = 0
    let big_car = 0
    let big_car_count = 0.0
    let count3 = 0
    let big_van = 0
    let big_van_count = 0.0
    let count4 = 0
    let cuscate_van = 0
    let cuscate_van_count = 0.0
    let count5 = 0
    let congestion = 1000000000
    let congestion_place = ''

    console.log('==================')
    for (var i=0; i<result.length; i++){
      if (result[i]['31']['speed']!=='0'){
        small_car += parseInt(result[i]['31']['speed'])
        small_car_count +=1.0
        count1 += parseInt(result[i]['31']['traffic'])
        if (parseInt(result[i]['31']['speed']) < congestion ){
          congestion = parseInt(result[i]['31']['speed'])
          congestion_place = stations[i]
        }
      }
      if (result[i]['32']['speed']!=='0'){
        small_van += parseInt(result[i]['32']['speed'])
        small_van_count +=1.0
        count2 += parseInt(result[i]['32']['traffic'])
      }
      if (result[i]['41']['speed']!=='0'){
        big_car += parseInt(result[i]['41']['speed'])
        big_car_count +=1.0
        count3 += parseInt(result[i]['41']['traffic'])
      }
      if (result[i]['42']['speed']!=='0'){
        big_van += parseInt(result[i]['42']['speed'])
        big_van_count +=1.0
        count4 += parseInt(result[i]['42']['traffic'])
      }
      if (result[i]['5']['speed']!=='0'){
        cuscate_van += parseInt(result[i]['5']['speed'])
        cuscate_van_count +=1.0
        count5 += parseInt(result[i]['5']['traffic'])
      }
    }

    console.log('|||||||||||||||||||')
    avg_small_car = (small_car/small_car_count).toFixed(2)
    avg_small_van = (small_van/small_van_count).toFixed(2)
    avg_big_car = (big_car/big_car_count).toFixed(2)
    avg_big_van = (big_van/big_van_count).toFixed(2)
    avg_cuscate_van = (cuscate_van/cuscate_van_count).toFixed(2)

    console.log("stations: " + stations.length)
    console.log("miles: " + miles.length)
    let sum_length = 0
    for (var i=0;i<miles.length; i++){
      sum_length += miles[i]
    }
    sum_length = sum_length.toFixed(2)
    let time = ((sum_length / avg_small_car)*60).toFixed(2)
    res.render('campgrounds/searchTraffic' ,{time: time, sum_length: sum_length, miles: miles, congestion_place: congestion_place, congestion: congestion, stations: stations, from: from, to: to, avg_small_car: avg_small_car,avg_small_van: avg_small_van,avg_big_car: avg_big_car, avg_big_van: avg_big_van, avg_cuscate_van: avg_cuscate_van, count1: count1, count2: count2, count3: count3, count4: count4, count5: count5});
})

//road - show form to create new campground
router.get("/road", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/road"); 
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
  let l1 = [], rd = ''
  switch(req.query.road_type){
    case "國道一號":
      rd = "國1"
      break
    case "國道三號":
      rd = "國3"
      break
    case "國道五號":
      rd = "國5"
      break
  }
  Object.keys(interchanges).forEach((inter)=>{
    let i = interchanges[inter][0]
    if (i.road.indexOf(rd)>-1){
      l1.push(inter)
    }
  })
  res.render("campgrounds/new", {rd:req.query.road_type, l1}); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});


module.exports = router;

