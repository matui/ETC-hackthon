var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


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
    console.log(req)
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var start_point = req.body.start_point
    var destination = req.body.destination
    var vehicle_type = req.body.vehicle_type
    var road_type = req.body.road_type
    var road_description = req.body.road_description
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var direction = req.body.direction
    var newCampground = {direction: direction, start_point: start_point, destination: destination, road_type: road_type, vehicle_type: vehicle_type, description: desc, author:author}
    console.log('=================================')
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            //console.log(newlyCreated);
            //res.redirect("/campgrounds");
            //res.redirect('/traffic/' + start_point + '/' + destination + '/S')
            res.redirect("/campgrounds");
        }
    });
});


//road - show form to create new campground
router.get("/searchTraffic/:from/:to/:direction", function(req, res){
  let {etcs,interchanges} = require('../storage.js')
      let {from,to,direction,type} = req.params
      console.log(`Get traffic query from ${from} to ${to} direction ${direction} type ${type}`)
      let result =[]
      let miles = []
      let city_paits = []
      let current = undefined
      let next = ''
      for(var i in interchanges[from]){
    console.log(`Candidate ${interchanges[from][i]}`)
    if (interchanges[from][i].direction == direction){
        console.log("Get")
        current = interchanges[from][i].id
        break
    }
      }
      while (current && etcs[current].From != to){
          next = Object.keys(etcs[current].data)[0]
          console.log(etcs[current],next)
          if(!next) break
          let length = Number(Math.abs(etcs[current].Mileage - etcs[next].Mileage).toFixed(1))
          if(type){
              let {traffic,speed} = etcs[current].data[next][type]
              result.push({from:current,to:next,length,traffic,speed})
          }
          else
              result.push(etcs[current].data[next])
              miles.push(length)
          current = next
      }
      //res.json({result})
      //

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

      console.log('==================')
      for (var i=0; i<result.length; i++){
        if (result[i]['31']['speed']!=='0'){
          small_car += parseInt(result[i]['31']['speed'])
          small_car_count +=1.0
          count1 += parseInt(result[i]['31']['traffic'])
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

      res.render('campgrounds/searchTraffic' ,{from: from, to: to, avg_small_car: avg_small_car,avg_small_van: avg_small_van,avg_big_car: avg_big_car, avg_big_van: avg_big_van, avg_cuscate_van: avg_cuscate_van, count1: count1, count2: count2, count3: count3, count4: count4, count5: count5});



});

//road - show form to create new campground
router.get("/road", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/road"); 
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
  rd = req.query.road_type
  dir = req.query.direction
  l11 = ["基隆端(基隆港)","基隆(長庚醫院)","八堵","大華系統(連接台62)","五堵","汐止&汐止系統(連接國3)","東湖","內湖(南京東、成功路)","圓山(建國北路)","台北(重慶北、士林)","三重","五股","高公局","林口(文化一路)","林口(文化北路)","桃園","機場系統(連接國2)","中壢服務區","內壢","中壢","平鎮系統(連接台66)","幼獅","楊梅","湖口","竹北","新竹(光復路)","新竹(科學園區)","新竹系統(連接國3)","頭份","頭屋","苗栗","銅鑼","三義","后里","台中系統(連接國4)","豐原","大雅","台中(台灣大道)","南屯","王田","彰化系統(連接國3)","彰化","埔鹽系統(連接台76)","員林","北斗","西螺","虎尾(斗六聯絡道)","斗南(158縣道)","雲林系統(連接台78)","大林","民雄","嘉義","水上","嘉義系統(連接台82)","新營服務區","新營","下營系統(連接台84)","麻豆","安定","台南系統(連接國8)","永康","大灣","台南(仁德)","仁德系統(連接台86)","路竹","高科","岡山","楠梓(旗楠路)","楠梓(鳳楠路)","鼎金系統(連接國10、大中路)","高雄(九如、建國路)","高雄(中正、三多路)","高雄端(中山四路)","基隆(長庚醫院)","八堵","大華系統(連接台62)","五堵","汐止&汐止系統(連接國3)","東湖","內湖(南京東、成功路)","圓山(建國北路)","台北(重慶北、士林)","三重","五股","高公局","林口(文化一路)","林口(文化北路)","桃園","機場系統(連接國2)","中壢服務區","內壢","中壢","平鎮系統(連接台66)","幼獅","楊梅","湖口","竹北","新竹(光復路)","新竹(科學園區)","新竹系統(連接國3)","頭份","頭屋","苗栗","銅鑼","三義","后里","台中系統(連接國4)","豐原","大雅","台中(台灣大道)","南屯","王田","彰化系統(連接國3)","彰化","埔鹽系統(連接台76)","員林","北斗","西螺","虎尾(斗六聯絡道)","斗南(158縣道)","雲林系統(連接台78)","大林","民雄","嘉義","水上","嘉義系統(連接台82)","新營服務區","新營","下營系統(連接台84)","麻豆","安定","台南系統(連接國8)","永康","大灣","台南(仁德)","仁德系統(連接台86)","路竹","高科","岡山","楠梓(旗楠路)","楠梓(鳳楠路)","鼎金系統(連接國10、大中路)","高雄(九如、建國路)","高雄(中正、三多路)","瑞隆路南下出口匝道","高雄端(新生路)","汐止&汐止系統(連接國1平面)","堤頂","環北","五股(高架)","高公局","機場系統(連接國2)","中壢","堤頂","下塔悠北上出口匝道","環北","五股(高架)","高公局","機場系統(連接國2)"] 
  l33 = ["基金","瑪東系統(連接台62)","汐止系統(連接國1)","新台五路","南港(連接環東大道)","南港系統(連接國五)","木柵(連接國3甲)","新店(中興路)","安坑(中央、安康路)","中和(連接台64)","土城(連接台65)","樹林","三鶯","鶯歌系統(連接國2)","大溪(連接台66)","龍潭","關西服務區","關西","竹林","寶山","新竹系統(連接國1)","茄苳","香山","西濱(連接台61)","竹南","大山","後龍","西湖服務區","通霄","苑裡","大甲","中港系統(連接國4)","清水服務區","沙鹿","龍井","和美","彰化系統(連接國1)","快官(連接台74)","烏日","中投(連接台63)","霧峰(台3線、太平-台74)","霧峰系統(連接國6)","草屯","中興系統(台76-八卦山隧道)","中興","南投","南投服務區","名間","竹山","南雲","斗六","古坑(文化路)&古坑系統(連接台78)","古坑(朝陽路)","古坑服務區","梅山","竹崎(竹崎連絡道)","竹崎(159縣道)","中埔","水上系統(連接台82)","白河","東山服務區","柳營","烏山頭","官田系統(連接台84)","善化","新化系統(連接國8)","關廟(連接台86)","關廟服務區","田寮","燕巢系統(連接國10)","九如","長治","麟洛","竹田系統(連接台88)","崁頂","南州","瑪東系統(連接台62)","汐止系統(連接國1)","新台五路","南港(連接環東大道)","南港系統(連接國五)&南深路出口匝道","木柵(連接國3甲)","新店(中興路)","安坑(中央、安康路)","中和(連接台64)","土城(連接台65)","樹林","三鶯","鶯歌系統(連接國2)","大溪(連接台66)","龍潭","關西服務區","關西","竹林","寶山","新竹系統(連接國1)","茄苳","香山","西濱(連接台61)","竹南","大山","後龍","西湖服務區","通霄","苑裡","大甲","中港系統(連接國4)","清水服務區","沙鹿","龍井","和美","彰化系統(連接國1)","快官(連接台74)","烏日","中投(連接台63)","霧峰(台3線、太平-台74)","霧峰系統(連接國6)","草屯","中興系統(台76-八卦山隧道)","中興","南投","南投服務區","名間","竹山","南雲","斗六","古坑(文化路)&古坑系統(連接台78)","古坑(朝陽路)","古坑服務區","梅山","竹崎(竹崎連絡道)","竹崎(159縣道)","中埔","水上系統(連接台82)","白河","東山服務區","柳營","烏山頭","官田系統(連接台84)","善化","新化系統(連接國8)","關廟(連接台86)","關廟服務區","田寮","燕巢系統(連接國10)","九如","長治","麟洛","竹田系統(連接台88)","崁頂","南州","林邊(大鵬灣端)","台北端","萬芳(動物園、信義快)","萬芳(動物園、信義快)","木柵(連接國3)"]
  l55 = ["南港系統(連接國3)","石碇","坪林行控專用道","頭城","宜蘭(四城、大福)","宜蘭(壯圍)","羅東","石碇","坪林行控專用道","頭城","宜蘭(四城、大福)","宜蘭(壯圍)","羅東","蘇澳"]
  if (rd==="國道一號"){
    res.render("campgrounds/new", {rd:rd, dir: dir, l1:l11}); 
  }
  if (rd==="國道三號"){
    res.render("campgrounds/new", {rd:rd, dir: dir, l1:l33}); 
  }
  if (rd==="國道五號"){
    res.render("campgrounds/new", {rd:rd, dir: dir, l1:l55}); 
  }
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

