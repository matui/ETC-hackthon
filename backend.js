let {etcs,interchanges} = require('./storage.js')
function getInfo(req,res){
    let {from} = req.params
    console.log(`Get traffic query from ${from} to ${to} type ${type}`)
    res.json(etcs[from])
}

function getInter(req,res){
    let {road,direction} = req.params
    if (!road)
	return res.json(Object.keys(interchanges))
    let result = []
    Object.keys(interchanges).forEach((inter)=>{
	let i = interchanges[inter]
	if (i.road == road){
	    if(!direction || i.direction == direction)
		result.push(inter)
	}
    })
    return res.json(result)
}
     

function getTraffic(req,res){
    let {from,to,direction,type} = req.params
    console.log(`Get traffic query from ${from} to ${to} direction ${direction} type ${type}`)
    let result =[]
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
	current = next
    }
    res.json({result})
}

module.exports = {getTraffic,getInfo,getInter}

