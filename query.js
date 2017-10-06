const csv=require('csvtojson')
const request=require('request')
let etcs = require('./storage.js').etcs

let date = new Date()
date.setMinutes(date.getMinutes() - 20)
importETCMap(()=>{
   setInterval(download_car_speed,10*1000)
})

function importETCMap(cb){
   csv({
     noheader:true,
     headers: ['Road','Direction','ID','Length','Price','From','To','Lat','Long']
   })
   .fromFile('./data/ETCMap.csv')
   .on('json',(obj,index)=>{
       let id = obj.ID.replace(/\./g, '').replace(/\-/g, '')
       let Mileage = parseFloat(obj.ID.split('-')[1])
       obj.ID = id
       etcs[id] = obj
       etcs[id].Mileage = Mileage
       etcs[id].data = {}
   })
   .on('done',(error)=>{
       return cb()
   })
}

function download_car_speed(){
   let y = date.getFullYear()
   let m = ('0' + (date.getMonth() + 1)).slice(-2)
   let d = ('0' + date.getDate()).slice(-2)
   let h = ('0' + date.getHours()).slice(-2)
   let mi = ('0' + (date.getMinutes() - (date.getMinutes()%5))).slice(-2)
   let src = `http://tisvcloud.freeway.gov.tw/history/TDCS/M05A/${y}${m}${d}/${h}/TDCS_M05A_${y}${m}${d}_${h}${mi}00.csv`
   csv({
     noheader:true,
     headers: ['TimeInterval','GantryFrom','GantryTo','VehicleType','SpaceMeanSpeed','Traffic']
   })
   .fromStream(request.get(src))
   .on('json',(obj,index)=>{
       etcs[obj.GantryFrom].updateTime = obj.TimeInterval
       let data = etcs[obj.GantryFrom].data
       if(!data[obj.GantryTo])
           data[obj.GantryTo] = {}
       data[obj.GantryTo][obj.VehicleType] = {speed: obj.SpaceMeanSpeed, traffic: obj.Traffic}
   })
   .on('done',(error)=>{
      date.setMinutes(date.getMinutes() + 5)
      //console.log(JSON.stringify(etcs))
   })
}
