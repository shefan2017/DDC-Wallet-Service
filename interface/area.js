
var Config =require( "../csv/constain");
let AschJs=require("asch-js")
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate(),                    //日 
        "h+": this.getHours(),                   //小时 
        "m+": this.getMinutes(),                 //分 
        "s+": this.getSeconds(),                 //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()             //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
async function getArea(params) {
        console.log("===============Logs============= \n",params)
        let condition={};
        if(params.address){
            condition.address=params.address
        }
        console.log("===============Logs============= \n",condition)
        let count=await app.model.Area.count(condition);
        let areas=[];
        if(count>0){
            areas=await app.model.Area.findAll({
                condition,
                limit:params.limit||50,
                offset:params.offset||0
            })
        }
        return {count:count,list:areas}
    
} 
app.route.get("/areas",async (req)=>{
    let query=req.query;
    return await getArea(query)
})
app.route.get("/areas/:name",async (req)=>{
    let ares=await app.model.Area.findOne({condition:{name:req.params.name}})
    if(ares){
        return {success:true,data:ares}
    }else{
        return {suceess:false,error:"没有该区域信息"}
    }
})
app.route.get("/lands/:areaname",async (req)=>{
    let query=req.query;
    let condition={};
    let Area=await app.model.Area.findOne({condition:{name:req.params.areaname}})
    if(!Area){
        return {success:false,error:"没有该区域"}
    }
    condition.areaId=Area.id;
    console.log("\n req",req)
    if(query.status>=0){
        condition.status=query.status+"";
    }
    console.log("\n Status",condition)
    let count=await app.model.Land.count(condition);
    let lands=[];
    if(count>0){
        lands=await app.model.Land.findAll({
            condition
        });
        for(var i=0;i<lands.length;i++){
            let item=lands[i];
            if(item.status==Config.status.Aucting){
                let Auction=await app.model.Auction.findOne({condition:{id:item.auctionId}});
                if(Auction){
                    item.Auction=Auction;
                }else{
                    item.Auction=null;
                }
            }
        }
        if(query.status>=0){
            lands=lands.filter(function(item){
                return item.Auction?true:false;
            })
        }

    }
    return {count:count,list:lands}
})
//获取所有拍卖信息
app.route.get("/auctions",async (req)=>{
    let params=req.query;
    let condition={};
    if(params.status){//状态拍卖中或拍卖完成
        condition.status=params.status;
    }
        let limit=10||parseInt(params.limit);
        let offset=0 ||parseInt(params.offset);
    let count=await app.model.Aucting.count(condition);//参与人数
    let list=await app.model.Auction.findAll({
        condition:condition,
        limit:limit,
        offset:offset
    });
    return {success:true,count:count,list:list}
});
//获取拍卖详情
app.route.get("/auctions/:id",async (req)=>{
    let params=req.params;
    let Auction=await app.model.Auction.findOne({condition:{id:params.id}});
    if(!Auction){
        return {success:false, error:"拍卖不存在"}
    }
    //获取地块
    let Land=await app.model.Land.findOne({condition:{id:Auction.landId}});
    if(!Land)
    {
        return {success:false, error:"地块不存在"}
    }
    //获取10个参与人信息
    let limit=10||parseInt(params.limit);
    let offset=0 ||parseInt(params.offset);
    let logsCount=await app.model.Auctionslog.count({auctionId:Auction.id});
    let logs=await app.model.Auctionslog.findAll({condition:{auctionId:Auction.id},limit:limit,offset:offset})
    return {success:true,Auction:Auction,Land:Land,log_count:count,logs:logs}
})
//获取记录
app.route.get("/logs",async (req)=>{
    let params=req.query;
    let limit=params.limit||10;
    let offset=params.offset||0;
    let condition={};
    if(params.address){
        condition.address=params.address;
    }
    let count=await app.model.Log.count(condition)
    let list=[];
    if(count>0){
        list= await app.model.Log.findAll
        ({condition,limit:limit,offset:offset});
        list=list.map(function(item){
            var time=AschJs.utils.slots.getRealTime(item.timestamp);
            item.timestamp_format=(new Date(time)).format("yyyy/MM/dd hh:mm:ss")
            return item;
        })
    }
    
    return {success:true,count:count,list:list}
})
//我的地块
app.route.get("/myarea",async (req)=>{
    let params=req.query;
    if(!params.address){
        return {success:false,error:"the params of address is null"}
    }
    let limit=params.limit||10;
    let offset=params.offset||0;
    let condition={};
    if(params.address){
        condition.authorId=params.address;
    }
    console.log("app \n",condition)
    let count=await app.model.Land.count(condition);
    console.log("app \n",count,limit,offset)
    let list=[];
    if(count>0){
        list= await app.model.Land.findAll
        ({condition:condition,limit:limit,offset:offset});
        list=list.map(function(item){
            var time=AschJs.utils.slots.getRealTime(item.timestamp);
            item.timestamp_format=(new Date(time)).format("yyyy/MM/dd hh:mm:ss")
            return item;
        })
    }
    return {success:true,count:count,list:list}
})
app.route.get("/citys",async (req)=>{
    let params=req.query;
    let areas=await app.model.Area.findAll({
        limit:params.limit||50,
        offset:params.offset||0
    });
    let citys=areas.map(function(item){
        return item.address
    });
    let set=new Set(citys);
    let list=Array.from(set)
    return {success:true,list:list}

})