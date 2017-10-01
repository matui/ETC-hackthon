const csv=require('csvtojson')
const request=require('request')
let date = new Date()
date.setMinutes(date.getMinutes() - 20)
setInterval(download_car_speed,10*1000)
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
      console.log(JSON.stringify(obj))
   })
   .on('done',(error)=>{
      date.setMinutes(date.getMinutes() + 5)
   })
}
