let etcs = require('./storage.js').etcs
function getInfo(req,res){
    let {from} = req.params
    console.log(`Get traffic query from ${from} to ${to} type ${type}`)
    res.json(etcs[from])
}

function getTraffic(req,res){
    let {from,to,type} = req.params
    console.log(`Get traffic query from ${from} to ${to} type ${type}`)
    let result =[]
    let current = from
    let next = ''
    while (current != to){
        next = Object.keys(etcs[current].data)[0]
	console.log(etcs[current])
	if(!next) break
	let length = Number(Math.abs(etcs[current].Mileage - etcs[next].Mileage).toFixed(1))
	if(type){
	    let {traffic,speed} = etcs[current].data[next][type]
	    result.push({from:current,to:next,length,traffic,speed})
	}
	else
            result.push(etcs[current].data[next])
	current = next
    }
    res.json({result})
}

module.exports = {getTraffic,getInfo}

