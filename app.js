var http = require('http')
var express = require('express')
var app = express()
var server = http.createServer(app)
let etcs = require('./storage.js').etcs

app.get('/',function(request, response){
    console.log(`Receive request ${request}`)
    response.end('Hi!')
})
app.get('/traffic/:from/:to/:type',getTraffic)
app.get('/traffic/:from/:to',getTraffic)
app.get('/info/:from',getInfo)
server.listen(8080,'0.0.0.0',function(){
    console.log('Server run at http://127.0.0.1:8080/')
})

require('./query.js')

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
